-- ============================================================================
-- Shared helper functions: tenant resolution, RBAC checks and timestamps.
-- All helpers are SECURITY DEFINER so they can read membership tables without
-- recursively invoking the RLS policies that they themselves support.
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select org_id from public.users where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select is_super_admin from public.users where id = auth.uid()),
    false
  );
$$;

create or replace function public.current_role_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(array_agg(role_id), '{}'::uuid[])
  from public.user_roles
  where user_id = auth.uid();
$$;

-- Module/action RBAC check. Data scopes (own/team/territory/org) are stored on
-- role_permissions for the application layer; RLS currently enforces the
-- tenant boundary plus module/action access.
create or replace function public.has_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      where ur.user_id = auth.uid()
        and p.module = p_module
        and p.action = p_action
    );
$$;

-- Keep public.users in sync with Supabase Auth. An optional `org_id` in the
-- user's **app_metadata** (admin/service-role only, never user-editable)
-- lets an admin create an invited user that already belongs to a tenant.
-- Otherwise the user lands with a null org and can call
-- public.bootstrap_organization() after signing up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
begin
  begin
    v_org := nullif(new.raw_app_meta_data ->> 'org_id', '')::uuid;
  exception when others then
    v_org := null;
  end;

  if v_org is not null and not exists (select 1 from public.organizations where id = v_org) then
    v_org := null;
  end if;

  insert into public.users (id, org_id, email, full_name, avatar_url, status)
  values (
    new.id,
    v_org,
    coalesce(new.email, ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    case when new.email_confirmed_at is null then 'invited' else 'active' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
