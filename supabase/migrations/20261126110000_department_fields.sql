-- Department master details: code, description, manager and active status.
alter table public.departments add column if not exists code text;
alter table public.departments add column if not exists description text;
alter table public.departments add column if not exists manager_id uuid references public.employees (id) on delete set null;
alter table public.departments add column if not exists status text not null default 'active' check (status in ('active', 'inactive'));
