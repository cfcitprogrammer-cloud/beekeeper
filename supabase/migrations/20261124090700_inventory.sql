-- ============================================================================
-- INVENTORY: products, price lists, stock
-- ============================================================================

create table public.product_categories (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  parent_id  uuid references public.product_categories (id) on delete set null,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations (id) on delete cascade,
  sku              text not null,
  barcode          text,
  name             text not null,
  description      text,
  category_id      uuid references public.product_categories (id) on delete set null,
  brand            text,
  product_type     text not null default 'finished'
                   check (product_type in ('finished', 'raw_material', 'semi_finished', 'service')),
  base_uom_id      uuid not null references public.uoms (id),
  tax_rate_id      uuid references public.tax_rates (id) on delete set null,
  cost             numeric(14, 4) not null default 0,
  is_batch_tracked boolean not null default false,
  is_active        boolean not null default true,
  image_url        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (org_id, sku)
);

create index products_category_idx on public.products (category_id);
create index products_barcode_idx on public.products (barcode);

create table public.product_uom_conversions (
  product_id uuid not null references public.products (id) on delete cascade,
  uom_id     uuid not null references public.uoms (id) on delete cascade,
  factor     numeric(14, 6) not null,
  primary key (product_id, uom_id)
);

create table public.price_lists (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  name          text not null,
  currency_code text not null,
  valid_from    date,
  valid_to      date,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.price_list_items (
  price_list_id uuid not null references public.price_lists (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  uom_id        uuid not null references public.uoms (id) on delete cascade,
  price         numeric(14, 4) not null,
  min_qty       numeric(14, 3) not null default 1,
  primary key (price_list_id, product_id, uom_id, min_qty)
);

alter table public.accounts
  add constraint accounts_price_list_fk
  foreign key (price_list_id) references public.price_lists (id) on delete set null;

create table public.warehouses (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  name        text not null,
  type        text not null default 'warehouse'
              check (type in ('warehouse', 'van', 'store', 'transit')),
  employee_id uuid references public.employees (id) on delete set null,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

create table public.batches (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  batch_no    text not null,
  mfg_date    date,
  expiry_date date,
  created_at  timestamptz not null default now(),
  unique (product_id, batch_no)
);

create table public.stock_levels (
  id            uuid primary key default gen_random_uuid(),
  warehouse_id  uuid not null references public.warehouses (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  batch_id      uuid references public.batches (id) on delete set null,
  on_hand       numeric(14, 3) not null default 0,
  reserved      numeric(14, 3) not null default 0,
  available     numeric(14, 3) generated always as (on_hand - reserved) stored,
  reorder_level numeric(14, 3),
  updated_at    timestamptz not null default now()
);

-- Nullable batch_id cannot participate in a plain primary key. Use an
-- expression index so "no batch" still has exactly one row per warehouse/SKU.
create unique index stock_levels_wh_product_batch_key
  on public.stock_levels (warehouse_id, product_id, coalesce(batch_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Source of truth: every stock change is a signed movement row. A trigger
-- (next migration) keeps stock_levels in sync inside the same transaction.
create table public.stock_movements (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  warehouse_id  uuid not null references public.warehouses (id),
  product_id    uuid not null references public.products (id),
  batch_id      uuid references public.batches (id) on delete set null,
  movement_type text not null
                check (movement_type in ('receipt', 'issue', 'transfer_in', 'transfer_out',
                                         'adjustment', 'sale', 'return', 'production_in', 'production_out')),
  quantity      numeric(14, 3) not null,
  unit_cost     numeric(14, 4),
  ref_type      text,
  ref_id        uuid,
  notes         text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements (product_id, warehouse_id, created_at desc);
create index stock_movements_ref_idx on public.stock_movements (ref_type, ref_id);

create table public.stock_counts (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  warehouse_id uuid not null references public.warehouses (id),
  status       text not null default 'open' check (status in ('open', 'submitted', 'posted')),
  counted_at   timestamptz,
  counted_by   uuid references public.employees (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table public.stock_count_lines (
  id          uuid primary key default gen_random_uuid(),
  count_id    uuid not null references public.stock_counts (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  batch_id    uuid references public.batches (id) on delete set null,
  system_qty  numeric(14, 3) not null,
  counted_qty numeric(14, 3) not null
);

create unique index stock_count_lines_unique_idx
  on public.stock_count_lines (count_id, product_id, coalesce(batch_id, '00000000-0000-0000-0000-000000000000'::uuid));
