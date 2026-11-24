-- ============================================================================
-- SYSTEM: MASTER DATA
-- ============================================================================

create table public.master_data_types (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  code       text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, code)
);

create table public.master_data_items (
  id         uuid primary key default gen_random_uuid(),
  type_id    uuid not null references public.master_data_types (id) on delete cascade,
  code       text not null,
  label      text not null,
  metadata   jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type_id, code)
);

create index master_data_items_type_idx on public.master_data_items (type_id, sort_order);

create table public.territories (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  parent_id  uuid references public.territories (id) on delete set null,
  name       text not null,
  level      text not null,
  boundary   extensions.geography(polygon, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index territories_geo_idx on public.territories using gist (boundary);

create table public.uoms (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  code       text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, code)
);

create table public.tax_rates (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  name         text not null,
  rate         numeric(6, 3) not null,
  is_inclusive boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
