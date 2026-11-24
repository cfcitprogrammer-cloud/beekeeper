-- ============================================================================
-- INVENTORY: production (BOM) and assets
-- ============================================================================

create table public.boms (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  version    int not null default 1,
  output_qty numeric(14, 3) not null default 1,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, version)
);

create table public.bom_items (
  bom_id       uuid not null references public.boms (id) on delete cascade,
  component_id uuid not null references public.products (id) on delete cascade,
  quantity     numeric(14, 4) not null,
  scrap_pct    numeric(5, 2) not null default 0,
  primary key (bom_id, component_id)
);

create table public.production_orders (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  order_no     text not null,
  bom_id       uuid not null references public.boms (id),
  warehouse_id uuid not null references public.warehouses (id),
  planned_qty  numeric(14, 3) not null,
  produced_qty numeric(14, 3) not null default 0,
  scrap_qty    numeric(14, 3) not null default 0,
  status       text not null default 'planned'
               check (status in ('planned', 'released', 'in_progress', 'completed', 'cancelled')),
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, order_no)
);

create table public.production_consumption (
  production_order_id uuid not null references public.production_orders (id) on delete cascade,
  component_id        uuid not null references public.products (id) on delete cascade,
  planned_qty         numeric(14, 4) not null,
  actual_qty          numeric(14, 4) not null default 0,
  primary key (production_order_id, component_id)
);

create table public.assets (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.organizations (id) on delete cascade,
  asset_tag            text not null,
  name                 text not null,
  category             text,
  serial_no            text,
  purchase_date        date,
  purchase_cost        numeric(14, 2),
  useful_life_months   int,
  salvage_value        numeric(14, 2) default 0,
  status               text not null default 'available'
                       check (status in ('available', 'assigned', 'maintenance', 'retired', 'lost')),
  assigned_employee_id uuid references public.employees (id) on delete set null,
  assigned_outlet_id   uuid references public.outlets (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (org_id, asset_tag)
);

create index assets_employee_idx on public.assets (assigned_employee_id);
create index assets_outlet_idx on public.assets (assigned_outlet_id);

create table public.asset_assignments (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references public.assets (id) on delete cascade,
  employee_id  uuid references public.employees (id) on delete set null,
  outlet_id    uuid references public.outlets (id) on delete set null,
  assigned_at  timestamptz not null default now(),
  returned_at  timestamptz,
  condition_out text,
  condition_in  text
);

create table public.asset_maintenance (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references public.assets (id) on delete cascade,
  scheduled_on date,
  completed_on date,
  description  text,
  cost         numeric(14, 2)
);
