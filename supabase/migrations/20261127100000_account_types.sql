-- Account type master data (Configuration), and the account -> type link.
create table public.account_types (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  type        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

alter table public.account_types enable row level security;

create policy tenant_select on public.account_types
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'view'));
create policy tenant_insert on public.account_types
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'create'));
create policy tenant_update on public.account_types
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'update'));
create policy tenant_delete on public.account_types
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'delete'));

create trigger set_updated_at before update on public.account_types
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.account_types
  for each row execute function public.audit_trigger('accounts');

grant all on public.account_types to authenticated, service_role;

-- Defaults for existing and future organizations.
create or replace function public.seed_account_types(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.account_types (org_id, code, type, description)
  select p_org, v.code, v.type, v.description
  from (values
    ('CUST', 'Customer', 'Regular customer account'),
    ('VIP', 'VIP Customer', 'Priority customer account'),
    ('WHOLE', 'Wholesale', 'Wholesale buyer account'),
    ('RETAIL', 'Retail', 'Retail buyer account'),
    ('DIST', 'Distributor', 'Distributor account'),
    ('GOV', 'Government', 'Government or institutional account')
  ) as v(code, type, description)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_account_types_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_account_types(new.id);
  return new;
end;
$$;

drop trigger if exists seed_account_types on public.organizations;
create trigger seed_account_types after insert on public.organizations
  for each row execute function public.seed_account_types_on_organization();

select public.seed_account_types(id) from public.organizations;

alter table public.accounts add column if not exists account_type_id uuid references public.account_types (id) on delete set null;

update public.accounts a
   set account_type_id = at.id
  from public.account_types at
 where at.org_id = a.org_id
   and at.type = a.account_type
   and a.account_type_id is null;
