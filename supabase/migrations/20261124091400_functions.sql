-- ============================================================================
-- Functions and triggers that depend on the full schema.
-- ============================================================================

create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id from public.employees where user_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'users', 'roles', 'master_data_types', 'master_data_items',
    'territories', 'uoms', 'tax_rates', 'departments', 'positions', 'employees',
    'shifts', 'leave_types', 'accounts', 'contacts', 'leads', 'pipeline_stages',
    'opportunities', 'outlets', 'routes', 'visits', 'geofences',
    'product_categories', 'products', 'price_lists', 'warehouses', 'stock_levels',
    'boms', 'production_orders', 'assets', 'promos', 'orders', 'expense_categories',
    'expense_reports', 'expenses', 'invoices', 'payments', 'remittances', 'forms',
    'service_tickets', 'report_definitions', 'report_schedules', 'dashboard_layouts',
    'announcements'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stock ledger: every stock_movements insert updates stock_levels atomically.
-- ---------------------------------------------------------------------------
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- The trigger runs as the definer (bypassing RLS), so validate that every
  -- referenced row belongs to the movement's tenant before touching stock.
  if not exists (
    select 1 from public.warehouses w
    where w.id = new.warehouse_id and w.org_id = new.org_id
  ) then
    raise exception 'Warehouse % does not belong to organization %', new.warehouse_id, new.org_id;
  end if;

  if not exists (
    select 1 from public.products p
    where p.id = new.product_id and p.org_id = new.org_id
  ) then
    raise exception 'Product % does not belong to organization %', new.product_id, new.org_id;
  end if;

  if new.batch_id is not null and not exists (
    select 1
    from public.batches b
    join public.products p on p.id = b.product_id
    where b.id = new.batch_id and p.org_id = new.org_id
  ) then
    raise exception 'Batch % does not belong to organization %', new.batch_id, new.org_id;
  end if;

  update public.stock_levels
     set on_hand = on_hand + new.quantity,
         updated_at = now()
   where warehouse_id = new.warehouse_id
     and product_id = new.product_id
     and batch_id is not distinct from new.batch_id;

  if not found then
    insert into public.stock_levels (warehouse_id, product_id, batch_id, on_hand)
    values (new.warehouse_id, new.product_id, new.batch_id, new.quantity);
  end if;

  return new;
end;
$$;

drop trigger if exists apply_stock_movement on public.stock_movements;
create trigger apply_stock_movement
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ---------------------------------------------------------------------------
-- Prevent authenticated users from escalating their own profile.
-- Service role and direct database sessions (no JWT) are treated as trusted.
-- ---------------------------------------------------------------------------
create or replace function public.protect_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null
     or public.is_super_admin()
     or public.has_permission('administration', 'update') then
    return new;
  end if;

  new.org_id := old.org_id;
  new.email := old.email;
  new.status := old.status;
  new.is_super_admin := old.is_super_admin;
  return new;
end;
$$;

drop trigger if exists protect_user_columns on public.users;
create trigger protect_user_columns
  before update on public.users
  for each row execute function public.protect_user_columns();

-- ---------------------------------------------------------------------------
-- Monthly partitions for location_pings. Call from cron / pg_cron:
--   select public.ensure_location_ping_partitions(3);
-- ---------------------------------------------------------------------------
create or replace function public.ensure_location_ping_partitions(p_months_ahead int default 3)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  i          int;
  start_date date;
  end_date   date;
begin
  for i in 0..p_months_ahead loop
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

select public.ensure_location_ping_partitions(3);

-- ---------------------------------------------------------------------------
-- Self-serve onboarding: create an organization, make the caller its
-- administrator and seed sensible defaults.
-- ---------------------------------------------------------------------------
create or replace function public.bootstrap_organization(
  p_name text,
  p_code text,
  p_timezone text default 'UTC',
  p_currency_code text default 'USD'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid        uuid := auth.uid();
  v_org        uuid;
  v_admin_role uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.users where id = v_uid and org_id is not null) then
    raise exception 'User already belongs to an organization';
  end if;

  -- Ensure the profile row exists even if the auth trigger was not installed.
  insert into public.users (id, email, full_name)
  select
    u.id,
    coalesce(u.email, ''),
    coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1))
  from auth.users u
  where u.id = v_uid
  on conflict (id) do nothing;

  insert into public.organizations (name, code, timezone, currency_code)
  values (p_name, p_code, p_timezone, p_currency_code)
  returning id into v_org;

  insert into public.roles (org_id, name, description)
  values (v_org, 'Administrator', 'Full access to every module')
  returning id into v_admin_role;

  insert into public.role_permissions (role_id, permission_id, data_scope)
  select v_admin_role, p.id, 'org'
  from public.permissions p
  on conflict do nothing;

  insert into public.user_roles (user_id, role_id)
  values (v_uid, v_admin_role)
  on conflict do nothing;

  -- Assign the tenant after the role exists: the protect_user_columns trigger
  -- checks administration.update and would otherwise reset org_id/status.
  update public.users
     set org_id = v_org,
         status = 'active',
         updated_at = now()
   where id = v_uid;

  -- Master data types and starter items.
  insert into public.master_data_types (org_id, code, name)
  values
    (v_org, 'outlet_type', 'Outlet Type'),
    (v_org, 'account_type', 'Account Type'),
    (v_org, 'lead_source', 'Lead Source'),
    (v_org, 'payment_term', 'Payment Term'),
    (v_org, 'ticket_category', 'Ticket Category'),
    (v_org, 'skip_reason', 'Visit Skip Reason'),
    (v_org, 'lost_reason', 'Opportunity Lost Reason');

  insert into public.master_data_items (type_id, code, label, sort_order, metadata)
  select t.id, v.item_code, v.label, v.sort_order, v.metadata::jsonb
  from public.master_data_types t
  join (values
    ('outlet_type', 'retail', 'Retail', 1, '{}'),
    ('outlet_type', 'wholesale', 'Wholesale', 2, '{}'),
    ('outlet_type', 'distributor', 'Distributor', 3, '{}'),
    ('outlet_type', 'modern_trade', 'Modern Trade', 4, '{}'),
    ('outlet_type', 'horeca', 'Horeca', 5, '{}'),
    ('outlet_type', 'pharmacy', 'Pharmacy', 6, '{}'),
    ('account_type', 'retailer', 'Retailer', 1, '{}'),
    ('account_type', 'distributor', 'Distributor', 2, '{}'),
    ('account_type', 'wholesaler', 'Wholesaler', 3, '{}'),
    ('account_type', 'key_account', 'Key Account', 4, '{}'),
    ('lead_source', 'walk_in', 'Walk-in', 1, '{}'),
    ('lead_source', 'referral', 'Referral', 2, '{}'),
    ('lead_source', 'cold_call', 'Cold Call', 3, '{}'),
    ('lead_source', 'digital', 'Digital', 4, '{}'),
    ('lead_source', 'event', 'Event', 5, '{}'),
    ('payment_term', 'cash', 'Cash', 1, '{"days":0}'),
    ('payment_term', 'net_15', 'Net 15', 2, '{"days":15}'),
    ('payment_term', 'net_30', 'Net 30', 3, '{"days":30}'),
    ('payment_term', 'net_60', 'Net 60', 4, '{"days":60}'),
    ('ticket_category', 'hardware', 'Hardware', 1, '{}'),
    ('ticket_category', 'software', 'Software', 2, '{}'),
    ('ticket_category', 'delivery', 'Delivery', 3, '{}'),
    ('ticket_category', 'service', 'Service', 4, '{}'),
    ('ticket_category', 'other', 'Other', 5, '{}'),
    ('skip_reason', 'outlet_closed', 'Outlet Closed', 1, '{}'),
    ('skip_reason', 'no_stock', 'No Stock', 2, '{}'),
    ('skip_reason', 'owner_unavailable', 'Owner Unavailable', 3, '{}'),
    ('skip_reason', 'wrong_address', 'Wrong Address', 4, '{}'),
    ('skip_reason', 'other', 'Other', 5, '{}'),
    ('lost_reason', 'price', 'Price', 1, '{}'),
    ('lost_reason', 'competitor', 'Competitor', 2, '{}'),
    ('lost_reason', 'no_budget', 'No Budget', 3, '{}'),
    ('lost_reason', 'timing', 'Timing', 4, '{}'),
    ('lost_reason', 'other', 'Other', 5, '{}')
  ) as v(type_code, item_code, label, sort_order, metadata)
    on v.type_code = t.code
  where t.org_id = v_org;

  insert into public.pipeline_stages (org_id, name, sort_order, probability, is_won, is_lost)
  values
    (v_org, 'Prospecting', 1, 10, false, false),
    (v_org, 'Qualification', 2, 25, false, false),
    (v_org, 'Proposal', 3, 50, false, false),
    (v_org, 'Negotiation', 4, 75, false, false),
    (v_org, 'Won', 5, 100, true, false),
    (v_org, 'Lost', 6, 0, false, true);

  insert into public.leave_types (org_id, name, is_paid, annual_quota, carry_over)
  values
    (v_org, 'Vacation', true, 12, true),
    (v_org, 'Sick Leave', true, 10, false),
    (v_org, 'Unpaid Leave', false, null, false);

  insert into public.expense_categories (org_id, name, max_amount, requires_receipt)
  values
    (v_org, 'Fuel', null, true),
    (v_org, 'Travel', null, true),
    (v_org, 'Meals', null, true),
    (v_org, 'Accommodation', null, true),
    (v_org, 'Supplies', null, true),
    (v_org, 'Other', null, true);

  insert into public.uoms (org_id, code, name)
  values
    (v_org, 'PCS', 'Pieces'),
    (v_org, 'BOX', 'Box'),
    (v_org, 'KG', 'Kilogram'),
    (v_org, 'L', 'Litre');

  insert into public.warehouses (org_id, code, name, type)
  values (v_org, 'MAIN', 'Main Warehouse', 'warehouse');

  insert into public.price_lists (org_id, name, currency_code, is_default)
  values (v_org, 'Default', p_currency_code, true);

  insert into public.shifts (org_id, name, start_time, end_time, grace_minutes)
  values (v_org, 'Default Shift', '08:00', '17:00', 15);

  insert into public.territories (org_id, name, level)
  values (v_org, 'Unassigned', 'area');

  return v_org;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime: enable the tables that the web/mobile UI subscribes to.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array[
      'notifications', 'announcements', 'activity_feed', 'visits',
      'orders', 'service_tickets', 'comments'
    ] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;
