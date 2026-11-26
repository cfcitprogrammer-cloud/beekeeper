-- Position master details: job level, description, salary range and active status.
alter table public.positions add column if not exists job_level text;
alter table public.positions add column if not exists description text;
alter table public.positions add column if not exists min_salary numeric(14, 2);
alter table public.positions add column if not exists max_salary numeric(14, 2);
alter table public.positions add column if not exists status text not null default 'active' check (status in ('active', 'inactive'));
