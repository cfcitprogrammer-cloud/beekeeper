-- Contact source master data and the remaining contact fields.
create table public.contact_sources (
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

alter table public.contact_sources enable row level security;

create policy tenant_select on public.contact_sources
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'view'));
create policy tenant_insert on public.contact_sources
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'create'));
create policy tenant_update on public.contact_sources
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'update'));
create policy tenant_delete on public.contact_sources
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'delete'));

create trigger set_updated_at before update on public.contact_sources
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.contact_sources
  for each row execute function public.audit_trigger('accounts');

grant all on public.contact_sources to authenticated, service_role;

create or replace function public.seed_contact_sources(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.contact_sources (org_id, code, name, description, sort_order)
  select p_org, v.code, v.name, v.description, v.sort_order
  from (values
    ('referral', 'Referral', 'Referred by a customer or partner', 1),
    ('trade_show', 'Trade Show', 'Met at an event or trade show', 2),
    ('cold_call', 'Cold Call', 'Outbound cold call', 3),
    ('walk_in', 'Walk-in', 'Walk-in visitor', 4),
    ('digital', 'Digital', 'Website, social media or online ads', 5)
  ) as v(code, name, description, sort_order)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_contact_sources_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_contact_sources(new.id);
  return new;
end;
$$;

drop trigger if exists seed_contact_sources on public.organizations;
create trigger seed_contact_sources after insert on public.organizations
  for each row execute function public.seed_contact_sources_on_organization();

select public.seed_contact_sources(id) from public.organizations;

alter table public.contacts add column if not exists owner_id uuid references public.employees (id) on delete set null;
alter table public.contacts add column if not exists phone2 text;
alter table public.contacts add column if not exists date_of_birth date;
alter table public.contacts add column if not exists source_id uuid references public.contact_sources (id) on delete set null;
alter table public.contacts add column if not exists parent_contact_id uuid references public.contacts (id) on delete set null;
alter table public.contacts add column if not exists country text;
alter table public.contacts add column if not exists state text;
alter table public.contacts add column if not exists city text;
alter table public.contacts add column if not exists zip text;
alter table public.contacts add column if not exists description text;
