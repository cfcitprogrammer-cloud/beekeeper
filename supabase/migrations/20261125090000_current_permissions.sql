-- ============================================================================
-- Permissions read model for the application shell.
--
-- RLS lets a user read their own profile but not the role/permission tables
-- unless they hold administration.view. The shell still needs to know which
-- modules to show, so expose the caller's effective permissions through a
-- SECURITY DEFINER function that only ever returns rows for auth.uid().
-- ============================================================================

create or replace function public.current_permissions()
returns table (module text, action text, data_scope text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select distinct p.module, p.action, rp.data_scope
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = auth.uid()

  union

  select p.module, p.action, 'org'::text
  from public.permissions p
  where public.is_super_admin();
$$;

comment on function public.current_permissions() is
  'Effective module/action/data_scope permissions for the signed-in user.';

grant execute on function public.current_permissions() to authenticated;
