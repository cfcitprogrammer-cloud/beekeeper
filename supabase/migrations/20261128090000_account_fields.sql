-- Account source master data and the remaining account fields.
create table public.account_sources (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

alter table public.account_sources enable row level security;

create policy tenant_select on public.account_sources
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'view'));
create policy tenant_insert on public.account_sources
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'create'));
create policy tenant_update on public.account_sources
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'update'));
create policy tenant_delete on public.account_sources
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'delete'));

create trigger set_updated_at before update on public.account_sources
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.account_sources
  for each row execute function public.audit_trigger('accounts');

grant all on public.account_sources to authenticated, service_role;

create or replace function public.seed_account_sources(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.account_sources (org_id, code, name, description, sort_order)
  select p_org, v.code, v.name, v.description, v.sort_order
  from (values
    ('referral', 'Referral', 'Referred by a customer or partner', 1),
    ('walk_in', 'Walk-in', 'Walk-in customer', 2),
    ('cold_call', 'Cold Call', 'Outbound cold call', 3),
    ('digital', 'Digital', 'Website, social media or online ads', 4),
    ('trade_show', 'Trade Show', 'Event or trade show', 5),
    ('partner', 'Partner', 'Referred by a business partner', 6)
  ) as v(code, name, description, sort_order)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_account_sources_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_account_sources(new.id);
  return new;
end;
$$;

drop trigger if exists seed_account_sources on public.organizations;
create trigger seed_account_sources after insert on public.organizations
  for each row execute function public.seed_account_sources_on_organization();

select public.seed_account_sources(id) from public.organizations;

-- Account fields. Each column gets its own statement so the entity and type
-- generators can pick them up from the migration SQL.
alter table public.accounts add column if not exists source_id uuid references public.account_sources (id) on delete set null;
alter table public.accounts add column if not exists parent_account_id uuid references public.accounts (id) on delete set null;
alter table public.accounts add column if not exists account_site text;
alter table public.accounts add column if not exists website text;
alter table public.accounts add column if not exists is_partner boolean not null default false;
alter table public.accounts add column if not exists rating text check (rating in ('Hot', 'Warm', 'Cold'));
alter table public.accounts add column if not exists industry text;
alter table public.accounts add column if not exists number_of_employees int;
alter table public.accounts add column if not exists ownership text check (ownership in ('Privately Held', 'Public Company', 'Partnership', 'Sole Proprietorship', 'Non-profit', 'Government'));
alter table public.accounts add column if not exists description text;
alter table public.accounts add column if not exists billing_country text;
alter table public.accounts add column if not exists billing_city text;
alter table public.accounts add column if not exists billing_region text;
alter table public.accounts add column if not exists billing_zip text;
alter table public.accounts add column if not exists shipping_country text;
alter table public.accounts add column if not exists shipping_city text;
alter table public.accounts add column if not exists shipping_region text;
alter table public.accounts add column if not exists shipping_zip text;

create index accounts_source_idx on public.accounts (source_id);
create index accounts_parent_idx on public.accounts (parent_account_id);

-- Superseded by the account-type master relation, the addresses table, and
-- the new structured billing/shipping columns.
alter table public.accounts drop column if exists account_type;
alter table public.accounts drop column if exists billing_address;
alter table public.accounts drop column if exists shipping_address;
