-- Education history: one employee can have many education records.
create table public.employee_education (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references public.employees (id) on delete cascade,
  school_name      text not null,
  education_level  text,
  course           text,
  year_graduated   int,
  description      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index employee_education_employee_idx on public.employee_education (employee_id);

alter table public.employee_education enable row level security;

create policy tenant_select on public.employee_education
  for select to authenticated
  using (
    exists (select 1 from public.employees e where e.id = public.employee_education.employee_id and e.org_id = public.current_org_id())
    and public.has_permission('employees', 'view')
  );
create policy tenant_insert on public.employee_education
  for insert to authenticated
  with check (
    exists (select 1 from public.employees e where e.id = public.employee_education.employee_id and e.org_id = public.current_org_id())
    and public.has_permission('employees', 'create')
  );
create policy tenant_update on public.employee_education
  for update to authenticated
  using (
    exists (select 1 from public.employees e where e.id = public.employee_education.employee_id and e.org_id = public.current_org_id())
    and public.has_permission('employees', 'update')
  )
  with check (
    exists (select 1 from public.employees e where e.id = public.employee_education.employee_id and e.org_id = public.current_org_id())
    and public.has_permission('employees', 'update')
  );
create policy tenant_delete on public.employee_education
  for delete to authenticated
  using (
    exists (select 1 from public.employees e where e.id = public.employee_education.employee_id and e.org_id = public.current_org_id())
    and public.has_permission('employees', 'delete')
  );

create trigger set_updated_at before update on public.employee_education
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.employee_education
  for each row execute function public.audit_trigger('employees');

grant all on public.employee_education to authenticated, service_role;

-- Carry any existing single education entry into the new history table.
insert into public.employee_education
  (employee_id, school_name, education_level, course, year_graduated)
select id, school_name, highest_education, course, year_graduated
from public.employees
where coalesce(school_name, '') <> ''
   or coalesce(course, '') <> ''
   or coalesce(highest_education, '') <> ''
   or year_graduated is not null;
