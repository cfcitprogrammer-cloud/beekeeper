-- ============================================================================
-- Cross-cutting application services:
--   * audit log writes from the app and from table triggers
--   * tenant relationship validation for the generic CRUD layer
--   * non-admin starter roles
--   * ledger-style derived totals (orders, invoices) and promo budgets
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create or replace function public.log_audit(
  p_module text,
  p_entity text,
  p_entity_id uuid,
  p_action text,
  p_changes jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid := public.current_org_id();
begin
  -- During onboarding the caller has no tenant yet; there is nothing to scope.
  if auth.uid() is null or v_org is null then
    return;
  end if;

  insert into public.audit_logs (org_id, user_id, module, entity_type, entity_id, action, changes)
  values (
    v_org,
    auth.uid(),
    p_module,
    p_entity,
    p_entity_id,
    p_action,
    coalesce(p_changes, '{}'::jsonb)
  );
end;
$$;

comment on function public.log_audit(text, text, uuid, text, jsonb) is
  'Writes an audit row for the signed-in user and their current organization.';

grant execute on function public.log_audit(text, text, uuid, text, jsonb) to authenticated;

create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_action text;
begin
  if tg_op = 'DELETE' then
    v_id := old.id;
  else
    v_id := new.id;
  end if;

  v_action := case tg_op
    when 'INSERT' then 'create'
    when 'UPDATE' then 'update'
    else 'delete'
  end;

  perform public.log_audit(
    coalesce(tg_argv[0], 'general'),
    tg_table_name,
    v_id,
    v_action,
    jsonb_build_object('operation', tg_op)
  );

  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'users', 'roles', 'approval_workflows', 'approvals',
    'master_data_types', 'master_data_items', 'territories', 'uoms', 'tax_rates',
    'departments', 'positions', 'employees', 'employee_documents', 'shifts',
    'attendances', 'leave_types', 'leaves', 'holidays',
    'accounts', 'contacts', 'leads', 'pipeline_stages', 'opportunities', 'activities',
    'outlets', 'routes', 'visits', 'geofences',
    'product_categories', 'products', 'price_lists', 'warehouses', 'batches',
    'stock_movements', 'stock_counts',
    'boms', 'production_orders', 'assets', 'asset_assignments',
    'promos', 'orders', 'sales_transactions', 'sales_targets',
    'expense_categories', 'expense_reports', 'expenses',
    'invoices', 'payments', 'remittances',
    'forms', 'form_submissions', 'service_tickets', 'report_definitions',
    'report_schedules', 'dashboard_layouts', 'announcements', 'activity_feed'
  ] loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('drop trigger if exists write_audit on public.%I', t);
      execute format(
        'create trigger write_audit after insert or update or delete on public.%I for each row execute function public.audit_trigger(%L)',
        t,
        case
          when t in ('organizations', 'users', 'roles', 'approval_workflows', 'approvals') then 'administration'
          when t in ('master_data_types', 'master_data_items', 'territories', 'uoms', 'tax_rates') then 'master_data'
          when t in ('departments', 'positions', 'employees', 'employee_documents') then 'employees'
          when t in ('shifts', 'attendances') then 'attendance'
          when t in ('leave_types', 'leaves', 'holidays') then 'leaves'
          when t in ('accounts', 'contacts') then 'accounts'
          when t in ('leads', 'activities') then 'leads'
          when t in ('pipeline_stages', 'opportunities') then 'opportunities'
          when t in ('outlets', 'routes', 'visits', 'geofences') then 'outlets'
          when t in ('product_categories', 'products', 'price_lists') then 'products'
          when t in ('warehouses', 'batches', 'stock_movements', 'stock_counts') then 'inventory'
          when t in ('boms', 'production_orders') then 'production'
          when t in ('assets', 'asset_assignments') then 'assets'
          when t in ('promos', 'orders', 'sales_transactions', 'sales_targets') then 'orders'
          when t in ('expense_categories', 'expense_reports', 'expenses') then 'expenses'
          when t in ('invoices', 'payments', 'remittances') then 'billing'
          when t in ('forms', 'form_submissions') then 'forms'
          when t = 'service_tickets' then 'tickets'
          when t like 'report_%' then 'reports'
          when t = 'dashboard_layouts' then 'dashboard'
          when t = 'announcements' then 'announcements'
          when t = 'activity_feed' then 'activity'
          else 'general'
        end
      );
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tenant validation for referenced records (app-layer FK consistency).
-- ---------------------------------------------------------------------------
create or replace function public.parent_belongs_to_org(
  p_table text,
  p_field text,
  p_id uuid,
  p_org uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_exists boolean := false;
begin
  if p_table !~ '^[a-z_]+$' or p_field !~ '^[a-z_]+$' or p_id is null or p_org is null then
    return false;
  end if;

  execute format(
    'select exists (select 1 from public.%I where %I = $1 and org_id = $2)',
    p_table,
    p_field
  ) into v_exists using p_id, p_org;

  return coalesce(v_exists, false);
end;
$$;

comment on function public.parent_belongs_to_org(text, text, uuid, uuid) is
  'True when a referenced row belongs to the supplied organization.';

grant execute on function public.parent_belongs_to_org(text, text, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Starter roles for new tenants. Administrator is created by bootstrap with
-- every permission; these roles are opt-in so roles are present for day one.
-- ---------------------------------------------------------------------------
create or replace function public.seed_standard_roles(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r record;
  v_role uuid;
begin
  if not exists (select 1 from public.organizations where id = p_org) then
    return;
  end if;

  for r in
    select * from (values
      (
        'Manager',
        array['employees','attendance','leaves','outlets','visits','tracking','accounts','leads','opportunities','orders','sales','promos','products','inventory','production','assets','expenses','billing','tickets','forms','reports','activity','announcements','dashboard','approvals']::text[],
        array['view','create','update','approve','export']::text[],
        'team'
      ),
      (
        'Sales Rep',
        array['accounts','contacts','leads','opportunities','orders','sales','promos','outlets','visits','activities','products','price_lists','inventory','expenses','reports']::text[],
        array['view','create','update','export']::text[],
        'own'
      ),
      (
        'Field Staff',
        array['employees','attendance','leaves','outlets','visits','tracking','expenses','forms','assets','sales','orders','products','inventory','announcements','activity']::text[],
        array['view','create','update']::text[],
        'own'
      ),
      (
        'Finance',
        array['orders','sales','billing','expenses','leaves','approvals','reports','accounts','employees','promos']::text[],
        array['view','create','update','approve','export']::text[],
        'org'
      ),
      (
        'Viewer',
        array['dashboard','activity','announcements','employees','attendance','leaves','outlets','visits','tracking','accounts','leads','opportunities','orders','sales','promos','products','inventory','production','assets','expenses','billing','forms','tickets','reports','administration','master_data']::text[],
        array['view','export']::text[],
        'org'
      )
    ) as v(name, modules, actions, scope)
  loop
    insert into public.roles (org_id, name, description)
    values (p_org, r.name, r.name || ' starter role')
    on conflict (org_id, name) do nothing;

    select id into v_role from public.roles where org_id = p_org and name = r.name;

    insert into public.role_permissions (role_id, permission_id, data_scope)
    select v_role, p.id, r.scope
    from public.permissions p
    where p.module = any(r.modules)
      and p.action = any(r.actions)
    on conflict do nothing;
  end loop;
end;
$$;

comment on function public.seed_standard_roles(uuid) is
  'Creates Manager, Sales Rep, Field Staff, Finance and Viewer roles for a tenant.';

grant execute on function public.seed_standard_roles(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Derived totals. These keep money fields as ledgers rather than editable
-- aggregate values.
-- ---------------------------------------------------------------------------
create or replace function public.recalc_order_totals()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order uuid := coalesce(new.order_id, old.order_id);
begin
  update public.orders o
     set subtotal       = coalesce(t.subtotal, 0),
         discount_total = coalesce(t.discount_total, 0),
         tax_total      = coalesce(t.tax_total, 0),
         grand_total    = coalesce(t.subtotal, 0) - coalesce(t.discount_total, 0) + coalesce(t.tax_total, 0),
         updated_at     = now()
    from (
      select
        sum(line_total) as subtotal,
        sum(discount_amount) as discount_total,
        sum(tax_amount) as tax_total
      from public.order_items
      where order_id = v_order
    ) t
   where o.id = v_order;

  return null;
end;
$$;

drop trigger if exists recalc_order_totals on public.order_items;
create trigger recalc_order_totals
  after insert or update or delete on public.order_items
  for each row execute function public.recalc_order_totals();

create or replace function public.recalc_invoice_paid()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice uuid := coalesce(new.invoice_id, old.invoice_id);
  v_paid numeric(14, 2);
  v_total numeric(14, 2);
begin
  select coalesce(sum(amount), 0) into v_paid
  from public.payment_allocations
  where invoice_id = v_invoice;

  select total into v_total from public.invoices where id = v_invoice;

  update public.invoices i
     set amount_paid = v_paid,
         status = case
           when i.status = 'void' then 'void'
           when v_paid >= v_total then 'paid'
           when v_paid > 0 then 'partially_paid'
           else 'open'
         end,
         updated_at = now()
   where i.id = v_invoice;

  return null;
end;
$$;

drop trigger if exists recalc_invoice_paid on public.payment_allocations;
create trigger recalc_invoice_paid
  after insert or update or delete on public.payment_allocations
  for each row execute function public.recalc_invoice_paid();

create or replace function public.enforce_promo_budget()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_budget numeric(14, 2);
  v_used numeric(14, 2);
begin
  select budget into v_budget from public.promos where id = new.promo_id;

  if v_budget is not null then
    select coalesce(sum(discount_value), 0) into v_used
    from public.promo_redemptions
    where promo_id = new.promo_id;

    if v_used > v_budget then
      raise exception 'Promotion budget of % exceeded (used %)', v_budget, v_used;
    end if;

    update public.promos
       set budget_used = v_used,
           updated_at = now()
     where id = new.promo_id;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_promo_budget on public.promo_redemptions;
create trigger enforce_promo_budget
  before insert or update on public.promo_redemptions
  for each row execute function public.enforce_promo_budget();
