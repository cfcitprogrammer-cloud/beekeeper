-- ============================================================================
-- SALES: promos, orders, sell-out transactions, targets
-- ============================================================================

create table public.promos (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  code         text not null,
  name         text not null,
  promo_type   text not null check (promo_type in ('percent', 'amount', 'buy_x_get_y', 'bundle', 'free_item')),
  valid_from   timestamptz not null,
  valid_to     timestamptz not null,
  budget       numeric(14, 2),
  budget_used  numeric(14, 2) not null default 0,
  is_stackable boolean not null default false,
  priority     int not null default 0,
  status       text not null default 'draft' check (status in ('draft', 'active', 'paused', 'expired')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, code)
);

create table public.promo_rules (
  id        uuid primary key default gen_random_uuid(),
  promo_id  uuid not null references public.promos (id) on delete cascade,
  rule_type text not null,
  config    jsonb not null
);

create table public.promo_scopes (
  promo_id   uuid not null references public.promos (id) on delete cascade,
  scope_type text not null,
  scope_ref  text not null,
  primary key (promo_id, scope_type, scope_ref)
);

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  order_no       text not null,
  account_id     uuid not null references public.accounts (id),
  outlet_id      uuid references public.outlets (id) on delete set null,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  visit_id       uuid references public.visits (id) on delete set null,
  salesperson_id uuid references public.employees (id) on delete set null,
  warehouse_id   uuid references public.warehouses (id) on delete set null,
  order_date     date not null default current_date,
  delivery_date  date,
  status         text not null default 'draft'
                 check (status in ('draft', 'submitted', 'approved', 'partially_fulfilled',
                                   'fulfilled', 'invoiced', 'closed', 'cancelled')),
  subtotal       numeric(14, 2) not null default 0,
  discount_total numeric(14, 2) not null default 0,
  tax_total      numeric(14, 2) not null default 0,
  grand_total    numeric(14, 2) not null default 0,
  currency_code  text not null default 'USD',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, order_no)
);

create index orders_account_idx on public.orders (account_id, order_date desc);
create index orders_salesperson_idx on public.orders (salesperson_id, order_date desc);
create index orders_org_status_idx on public.orders (org_id, status);

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid not null references public.products (id),
  uom_id          uuid not null references public.uoms (id),
  quantity        numeric(14, 3) not null,
  unit_price      numeric(14, 4) not null,
  discount_amount numeric(14, 2) not null default 0,
  tax_amount      numeric(14, 2) not null default 0,
  line_total      numeric(14, 2) not null,
  promo_id        uuid references public.promos (id) on delete set null,
  is_free_item    boolean not null default false,
  fulfilled_qty   numeric(14, 3) not null default 0
);

create index order_items_order_idx on public.order_items (order_id);

create table public.promo_redemptions (
  id             uuid primary key default gen_random_uuid(),
  promo_id       uuid not null references public.promos (id) on delete cascade,
  order_id       uuid not null references public.orders (id) on delete cascade,
  account_id     uuid references public.accounts (id) on delete set null,
  discount_value numeric(14, 2) not null,
  redeemed_at    timestamptz not null default now()
);

create table public.sales_transactions (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  txn_no         text not null,
  txn_type       text not null check (txn_type in ('sale', 'return', 'credit_memo')),
  order_id       uuid references public.orders (id) on delete set null,
  account_id     uuid references public.accounts (id) on delete set null,
  outlet_id      uuid references public.outlets (id) on delete set null,
  salesperson_id uuid references public.employees (id) on delete set null,
  txn_date       timestamptz not null default now(),
  total_amount   numeric(14, 2) not null,
  payment_method text,
  created_at     timestamptz not null default now(),
  unique (org_id, txn_no)
);

create index sales_transactions_date_idx on public.sales_transactions (org_id, txn_date desc);
create index sales_transactions_outlet_idx on public.sales_transactions (outlet_id, txn_date desc);
create index sales_transactions_salesperson_idx on public.sales_transactions (salesperson_id, txn_date desc);

create table public.sales_transaction_items (
  id         uuid primary key default gen_random_uuid(),
  txn_id     uuid not null references public.sales_transactions (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity   numeric(14, 3) not null,
  unit_price numeric(14, 4) not null,
  line_total numeric(14, 2) not null,
  unique (txn_id, product_id)
);

create table public.sales_targets (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  employee_id  uuid references public.employees (id) on delete cascade,
  territory_id uuid references public.territories (id) on delete cascade,
  product_id   uuid references public.products (id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  metric       text not null default 'revenue'
               check (metric in ('revenue', 'quantity', 'visits', 'new_accounts')),
  target_value numeric(14, 2) not null,
  created_at   timestamptz not null default now()
);
