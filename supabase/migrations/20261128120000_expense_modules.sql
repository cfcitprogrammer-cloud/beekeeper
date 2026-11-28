-- Expense sub-modules: cash advances, business development funds and field
-- expenses. Each is tenant-scoped and uses the existing expenses permission.
create table public.cash_advances (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  employee_id  uuid not null references public.employees (id),
  advance_date date not null,
  amount       numeric(14, 2) not null,
  purpose      text,
  status       text not null default 'draft'
               check (status in ('draft', 'approved', 'released', 'settled', 'cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.business_development_funds (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  employee_id uuid not null references public.employees (id),
  fund_date   date not null,
  amount      numeric(14, 2) not null,
  purpose     text,
  status      text not null default 'draft'
              check (status in ('draft', 'approved', 'released', 'settled', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.field_expenses (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  employee_id   uuid not null references public.employees (id),
  expense_date  date not null,
  category_id   uuid references public.expense_categories (id) on delete set null,
  visit_id      uuid references public.visits (id) on delete set null,
  amount        numeric(14, 2) not null,
  description   text,
  receipt_url   text,
  status        text not null default 'draft'
                check (status in ('draft', 'submitted', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cash_advances_employee_idx on public.cash_advances (employee_id, advance_date desc);
create index business_development_funds_employee_idx on public.business_development_funds (employee_id, fund_date desc);
create index field_expenses_employee_idx on public.field_expenses (employee_id, expense_date desc);

do $$
declare
  t text;
begin
  foreach t in array array['cash_advances', 'business_development_funds', 'field_expenses'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy tenant_select on public.%I for select to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''view''))',
      t
    );
    execute format(
      'create policy tenant_insert on public.%I for insert to authenticated with check (org_id = public.current_org_id() and public.has_permission(''expenses'', ''create''))',
      t
    );
    execute format(
      'create policy tenant_update on public.%I for update to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''update'')) with check (org_id = public.current_org_id() and public.has_permission(''expenses'', ''update''))',
      t
    );
    execute format(
      'create policy tenant_delete on public.%I for delete to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''delete''))',
      t
    );

    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
    execute format(
      'create trigger write_audit after insert or update or delete on public.%I for each row execute function public.audit_trigger(''expenses'')',
      t
    );
    execute format('grant all on public.%I to authenticated, service_role', t);
  end loop;
end $$;
