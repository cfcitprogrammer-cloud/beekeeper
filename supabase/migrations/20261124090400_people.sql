-- ============================================================================
-- PEOPLE: employees, attendance, leave
-- ============================================================================

create table public.departments (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  parent_id  uuid references public.departments (id) on delete set null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.positions (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  title      text not null,
  grade      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employees (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  user_id        uuid unique references public.users (id) on delete set null,
  employee_no    text not null,
  first_name     text not null,
  last_name      text not null,
  email          text,
  phone          text,
  department_id  uuid references public.departments (id) on delete set null,
  position_id    uuid references public.positions (id) on delete set null,
  manager_id     uuid references public.employees (id) on delete set null,
  territory_id   uuid references public.territories (id) on delete set null,
  hire_date      date,
  status         text not null default 'active'
                 check (status in ('active', 'on_leave', 'resigned', 'terminated')),
  device_id      text,
  is_field_staff boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, employee_no)
);

create index employees_user_idx on public.employees (user_id);
create index employees_manager_idx on public.employees (manager_id);
create index employees_org_status_idx on public.employees (org_id, status);

create table public.employee_documents (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  doc_type    text not null,
  file_url    text not null,
  expires_on  date,
  created_at  timestamptz not null default now()
);

create table public.shifts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  name          text not null,
  start_time    time not null,
  end_time      time not null,
  grace_minutes int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.employee_shifts (
  employee_id    uuid not null references public.employees (id) on delete cascade,
  shift_id       uuid not null references public.shifts (id) on delete cascade,
  effective_from date not null,
  effective_to   date,
  primary key (employee_id, shift_id, effective_from)
);

create table public.attendances (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations (id) on delete cascade,
  employee_id        uuid not null references public.employees (id) on delete cascade,
  work_date          date not null,
  clock_in_at        timestamptz,
  clock_out_at       timestamptz,
  clock_in_loc       extensions.geography(point, 4326),
  clock_out_loc      extensions.geography(point, 4326),
  clock_in_photo     text,
  clock_out_photo    text,
  status             text not null default 'present'
                     check (status in ('present', 'late', 'absent', 'half_day', 'on_leave', 'holiday')),
  late_minutes       int not null default 0,
  overtime_minutes   int not null default 0,
  is_within_geofence boolean,
  remarks            text,
  created_at         timestamptz not null default now(),
  unique (employee_id, work_date)
);

create index attendances_org_date_idx on public.attendances (org_id, work_date);

create table public.leave_types (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  name         text not null,
  is_paid      boolean not null default true,
  annual_quota numeric(5, 2),
  carry_over   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.leave_balances (
  employee_id   uuid not null references public.employees (id) on delete cascade,
  leave_type_id uuid not null references public.leave_types (id) on delete cascade,
  year          int not null,
  entitled      numeric(5, 2) not null default 0,
  used          numeric(5, 2) not null default 0,
  primary key (employee_id, leave_type_id, year)
);

create table public.leaves (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  employee_id   uuid not null references public.employees (id) on delete cascade,
  leave_type_id uuid not null references public.leave_types (id),
  start_date    date not null,
  end_date      date not null,
  days          numeric(5, 2) not null,
  reason        text,
  status        text not null default 'pending'
                check (status in ('draft', 'pending', 'approved', 'rejected', 'cancelled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index leaves_employee_idx on public.leaves (employee_id, start_date);

create table public.holidays (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  name         text not null,
  holiday_date date not null,
  created_at   timestamptz not null default now(),
  unique (org_id, holiday_date)
);
