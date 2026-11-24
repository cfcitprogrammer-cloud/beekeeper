-- ============================================================================
-- TOOLS: data import/export, report definitions, builder and schedules
-- ============================================================================

create table public.data_jobs (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations (id) on delete cascade,
  job_type         text not null check (job_type in ('import', 'export')),
  module           text not null,
  file_url         text,
  mapping          jsonb,
  status           text not null default 'queued'
                   check (status in ('queued', 'validating', 'running', 'completed', 'failed')),
  total_rows       int,
  success_rows     int,
  error_rows       int,
  error_report_url text,
  created_by       uuid references public.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  finished_at      timestamptz
);

create index data_jobs_org_idx on public.data_jobs (org_id, created_at desc);

create table public.report_definitions (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations (id) on delete cascade, -- null = system report
  name        text not null,
  description text,
  data_source text not null,
  config      jsonb not null,
  is_system   boolean not null default false,
  owner_id    uuid references public.users (id) on delete set null,
  visibility  text not null default 'private' check (visibility in ('private', 'shared', 'org')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index report_definitions_org_idx on public.report_definitions (org_id);

-- org_id is added (not in the original draft) so schedules and runs are
-- tenant-scoped even when they point at a system report definition.
create table public.report_schedules (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  report_id    uuid not null references public.report_definitions (id) on delete cascade,
  cron         text not null,
  format       text not null default 'xlsx' check (format in ('xlsx', 'csv', 'pdf')),
  recipients   jsonb not null,
  last_run_at  timestamptz,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.report_runs (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  report_id  uuid not null references public.report_definitions (id) on delete cascade,
  run_by     uuid references public.users (id) on delete set null,
  params     jsonb,
  file_url   text,
  row_count  int,
  created_at timestamptz not null default now()
);

create index report_runs_report_idx on public.report_runs (report_id, created_at desc);
