-- ============================================================================
-- OPERATIONS: outlets, routes, visits, GPS tracking, geofences
-- ============================================================================

create table public.outlets (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations (id) on delete cascade,
  account_id         uuid references public.accounts (id) on delete set null,
  outlet_code        text not null,
  name               text not null,
  outlet_type        text,
  tier               text,
  address            text,
  territory_id       uuid references public.territories (id) on delete set null,
  location           extensions.geography(point, 4326),
  geofence_radius_m  int not null default 100,
  visit_frequency    text,
  status             text not null default 'active'
                     check (status in ('prospect', 'active', 'inactive', 'closed')),
  photos             jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (org_id, outlet_code)
);

create index outlets_geo_idx on public.outlets using gist (location);
create index outlets_account_idx on public.outlets (account_id);
create index outlets_territory_idx on public.outlets (territory_id, status);

create table public.routes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  employee_id uuid references public.employees (id) on delete set null,
  day_of_week smallint check (day_of_week between 0 and 6),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.route_stops (
  route_id  uuid not null references public.routes (id) on delete cascade,
  outlet_id uuid not null references public.outlets (id) on delete cascade,
  sequence  int not null,
  primary key (route_id, outlet_id)
);

create table public.visits (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references public.organizations (id) on delete cascade,
  employee_id            uuid not null references public.employees (id) on delete cascade,
  outlet_id              uuid not null references public.outlets (id) on delete cascade,
  route_id               uuid references public.routes (id) on delete set null,
  planned_date           date,
  status                 text not null default 'planned'
                         check (status in ('planned', 'in_progress', 'completed', 'skipped', 'missed')),
  check_in_at            timestamptz,
  check_out_at           timestamptz,
  check_in_loc           extensions.geography(point, 4326),
  check_out_loc          extensions.geography(point, 4326),
  distance_from_outlet_m numeric(10, 2),
  skip_reason            text,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index visits_employee_date_idx on public.visits (employee_id, planned_date);
create index visits_outlet_date_idx on public.visits (outlet_id, planned_date);
create index visits_org_status_idx on public.visits (org_id, status);

create table public.visit_photos (
  id       uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  file_url text not null,
  caption  text,
  taken_at timestamptz not null default now()
);

-- High volume table, partitioned monthly by recorded_at.
create table public.location_pings (
  id          bigserial,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  recorded_at timestamptz not null,
  location    extensions.geography(point, 4326) not null,
  accuracy_m  numeric(8, 2),
  speed_mps   numeric(8, 2),
  battery_pct smallint,
  is_mock     boolean not null default false,
  primary key (id, recorded_at)
) partition by range (recorded_at);

create index location_pings_employee_idx on public.location_pings (employee_id, recorded_at desc);
create index location_pings_org_idx on public.location_pings (org_id, recorded_at desc);
create index location_pings_geo_idx on public.location_pings using gist (location);

-- Create the current and next two monthly partitions. The maintenance function
-- in a later migration keeps rolling partitions available.
do $$
declare
  i          int;
  start_date date;
  end_date   date;
begin
  for i in 0..2 loop
    start_date := (date_trunc('month', now()) + make_interval(months => i))::date;
    end_date   := (start_date + interval '1 month')::date;
    execute format(
      'create table if not exists public.%I partition of public.location_pings for values from (%L) to (%L)',
      'location_pings_' || to_char(start_date, 'YYYYMM'),
      start_date,
      end_date
    );
  end loop;
end;
$$;

create table public.geofences (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  name       text not null,
  shape      extensions.geography(polygon, 4326) not null,
  rule       text not null default 'allowed' check (rule in ('allowed', 'restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index geofences_geo_idx on public.geofences using gist (shape);
