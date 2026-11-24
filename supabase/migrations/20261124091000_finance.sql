-- ============================================================================
-- FINANCE: expenses, billing and collection
-- ============================================================================

create table public.expense_categories (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations (id) on delete cascade,
  name             text not null,
  max_amount       numeric(14, 2),
  requires_receipt boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.expense_reports (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  report_no      text not null,
  employee_id    uuid not null references public.employees (id),
  title          text,
  total_amount   numeric(14, 2) not null default 0,
  status         text not null default 'draft'
                 check (status in ('draft', 'submitted', 'approved', 'rejected', 'reimbursed')),
  submitted_at   timestamptz,
  reimbursed_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, report_no)
);

create index expense_reports_employee_idx on public.expense_reports (employee_id, status);

create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid references public.expense_reports (id) on delete cascade,
  org_id        uuid not null references public.organizations (id) on delete cascade,
  employee_id   uuid not null references public.employees (id),
  category_id   uuid not null references public.expense_categories (id),
  expense_date  date not null,
  amount        numeric(14, 2) not null,
  currency_code text not null default 'USD',
  description   text,
  receipt_url   text,
  visit_id      uuid references public.visits (id) on delete set null,
  distance_km   numeric(8, 2),
  status        text not null default 'draft'
                check (status in ('draft', 'submitted', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index expenses_org_employee_idx on public.expenses (org_id, employee_id, expense_date desc);
create index expenses_report_idx on public.expenses (report_id);

create table public.invoices (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  invoice_no   text not null,
  account_id   uuid not null references public.accounts (id),
  order_id     uuid references public.orders (id) on delete set null,
  invoice_date date not null default current_date,
  due_date     date not null,
  subtotal     numeric(14, 2) not null,
  tax_total    numeric(14, 2) not null default 0,
  total        numeric(14, 2) not null,
  amount_paid  numeric(14, 2) not null default 0,
  status       text not null default 'open'
               check (status in ('draft', 'open', 'partially_paid', 'paid', 'overdue', 'void')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, invoice_no)
);

create index invoices_account_idx on public.invoices (account_id, status, due_date);
create index invoices_org_status_idx on public.invoices (org_id, status, due_date);

create table public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  product_id  uuid references public.products (id) on delete set null,
  description text,
  quantity    numeric(14, 3) not null,
  unit_price  numeric(14, 4) not null,
  line_total  numeric(14, 2) not null
);

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  payment_no    text not null,
  account_id    uuid not null references public.accounts (id),
  collected_by  uuid references public.employees (id) on delete set null,
  visit_id      uuid references public.visits (id) on delete set null,
  method        text not null check (method in ('cash', 'check', 'bank_transfer', 'card', 'e_wallet')),
  amount        numeric(14, 2) not null,
  reference_no  text,
  check_date    date,
  received_at   timestamptz not null default now(),
  proof_url     text,
  status        text not null default 'received'
                check (status in ('received', 'deposited', 'cleared', 'bounced', 'void')),
  remittance_id uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, payment_no)
);

create index payments_account_idx on public.payments (account_id, received_at desc);
create index payments_remittance_idx on public.payments (remittance_id);

create table public.payment_allocations (
  id         uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  amount     numeric(14, 2) not null,
  unique (payment_id, invoice_id)
);

create table public.remittances (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  employee_id    uuid not null references public.employees (id),
  total_amount   numeric(14, 2) not null,
  bank_reference text,
  deposited_at   timestamptz,
  verified_by    uuid references public.users (id) on delete set null,
  status         text not null default 'pending'
                 check (status in ('pending', 'deposited', 'verified', 'discrepancy')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.payments
  add constraint payments_remittance_fk
  foreign key (remittance_id) references public.remittances (id) on delete set null;
