-- Employment type master data (Configuration), per-address location fields,
-- and the employee -> employment type link.
create table public.employment_types (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  type        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

alter table public.employment_types enable row level security;

create policy tenant_select on public.employment_types
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('employees', 'view'));
create policy tenant_insert on public.employment_types
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('employees', 'create'));
create policy tenant_update on public.employment_types
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('employees', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('employees', 'update'));
create policy tenant_delete on public.employment_types
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('employees', 'delete'));

create trigger set_updated_at before update on public.employment_types
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.employment_types
  for each row execute function public.audit_trigger('employees');

grant all on public.employment_types to authenticated, service_role;

-- Default employment types for every organization, including new ones.
create or replace function public.seed_employment_types(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.employment_types (org_id, code, type, description)
  select p_org, v.code, v.type, v.description
  from (values
    ('PROB', 'Probationary', 'Initial probationary employment'),
    ('REG', 'Regular', 'Regular employment'),
    ('CON', 'Contractual', 'Contractual engagement'),
    ('PROJ', 'Project-Based', 'Project-based employment'),
    ('CONS', 'Consultant', 'Consultancy engagement'),
    ('INT', 'Intern', 'Internship')
  ) as v(code, type, description)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_employment_types_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_employment_types(new.id);
  return new;
end;
$$;

drop trigger if exists seed_employment_types on public.organizations;
create trigger seed_employment_types after insert on public.organizations
  for each row execute function public.seed_employment_types_on_organization();

select public.seed_employment_types(id) from public.organizations;

alter table public.employees add column if not exists employment_type_id uuid references public.employment_types (id) on delete set null;
alter table public.employees add column if not exists present_province text;
alter table public.employees add column if not exists present_city_municipality text;
alter table public.employees add column if not exists present_barangay text;
alter table public.employees add column if not exists present_zip_code text;
alter table public.employees add column if not exists permanent_province text;
alter table public.employees add column if not exists permanent_city_municipality text;
alter table public.employees add column if not exists permanent_barangay text;
alter table public.employees add column if not exists permanent_zip_code text;

-- Preserve existing values by moving them into the present address.
update public.employees e
   set present_province = coalesce(e.present_province, e.province),
       present_city_municipality = coalesce(e.present_city_municipality, e.city_municipality),
       present_barangay = coalesce(e.present_barangay, e.barangay),
       present_zip_code = coalesce(e.present_zip_code, e.zip_code);

-- Link existing text employment types to their master data rows.
update public.employees e
   set employment_type_id = et.id
  from public.employment_types et
 where et.org_id = e.org_id
   and et.type = e.employment_type
   and e.employment_type_id is null;
