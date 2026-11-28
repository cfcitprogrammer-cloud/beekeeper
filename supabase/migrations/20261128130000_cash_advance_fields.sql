-- Cash advance purpose master data, date range, specification and attachment.
create table public.cash_advance_purposes (
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

alter table public.cash_advance_purposes enable row level security;

create policy tenant_select on public.cash_advance_purposes
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('expenses', 'view'));
create policy tenant_insert on public.cash_advance_purposes
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('expenses', 'create'));
create policy tenant_update on public.cash_advance_purposes
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('expenses', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('expenses', 'update'));
create policy tenant_delete on public.cash_advance_purposes
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('expenses', 'delete'));

create trigger set_updated_at before update on public.cash_advance_purposes
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.cash_advance_purposes
  for each row execute function public.audit_trigger('expenses');

grant all on public.cash_advance_purposes to authenticated, service_role;

create or replace function public.seed_cash_advance_purposes(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.cash_advance_purposes (org_id, code, name, description, sort_order)
  select p_org, v.code, v.name, v.description, v.sort_order
  from (values
    ('repairs', 'Repairs', 'Repair-related cash advances', 1),
    ('maintenance', 'Maintenance', 'Maintenance-related cash advances', 2),
    ('ca_vs_incentive', 'CA VS Incentive', 'Cash advance for VS incentive', 3),
    ('sampling_activity', 'Sampling Activity', 'Sampling and product activity', 4),
    ('others', 'Others', 'Specify the purpose when Others is selected', 5)
  ) as v(code, name, description, sort_order)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_cash_advance_purposes_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_cash_advance_purposes(new.id);
  return new;
end;
$$;

drop trigger if exists seed_cash_advance_purposes on public.organizations;
create trigger seed_cash_advance_purposes after insert on public.organizations
  for each row execute function public.seed_cash_advance_purposes_on_organization();

select public.seed_cash_advance_purposes(id) from public.organizations;

alter table public.cash_advances rename column advance_date to date_from;
alter table public.cash_advances add column if not exists date_to date;
alter table public.cash_advances add column if not exists purpose_id uuid references public.cash_advance_purposes (id) on delete set null;
alter table public.cash_advances add column if not exists purpose_other text;
alter table public.cash_advances add column if not exists attachment_path text;

-- Carry any existing free-text purposes over to the new master values.
insert into public.cash_advance_purposes (org_id, code, name, sort_order)
select distinct a.org_id,
       regexp_replace(lower(trim(a.purpose)), '[^a-z0-9]+', '_', 'g'),
       trim(a.purpose),
       99
  from public.cash_advances a
 where nullif(trim(a.purpose), '') is not null
on conflict (org_id, code) do nothing;

update public.cash_advances a
   set purpose_id = p.id
  from public.cash_advance_purposes p
 where p.org_id = a.org_id
   and lower(p.name) = lower(trim(a.purpose))
   and a.purpose_id is null;

alter table public.cash_advances drop column if exists purpose;

create index cash_advances_purpose_idx on public.cash_advances (purpose_id);
