-- ============================================================================
-- Row Level Security
--
-- Two layers:
--   1. Tenant isolation: every row is constrained to public.current_org_id().
--   2. Module/action RBAC: reads require `<module>.view`, writes require
--      `<module>.create|update|delete` via public.has_permission().
--
-- Data scopes (own/team/territory/org) are captured on role_permissions and
-- are enforced by the application query layer for now.
-- ============================================================================

-- Enable RLS on every base table (partitions inherit their parent's policies).
do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'users', 'roles', 'permissions', 'role_permissions',
    'user_roles', 'audit_logs', 'approval_workflows', 'approvals', 'notifications',
    'master_data_types', 'master_data_items', 'territories', 'uoms', 'tax_rates',
    'departments', 'positions', 'employees', 'employee_documents', 'shifts',
    'employee_shifts', 'attendances', 'leave_types', 'leave_balances', 'leaves',
    'holidays', 'accounts', 'contacts', 'leads', 'pipeline_stages', 'opportunities',
    'activities', 'outlets', 'routes', 'route_stops', 'visits', 'visit_photos',
    'location_pings', 'geofences', 'product_categories', 'products',
    'product_uom_conversions', 'price_lists', 'price_list_items', 'warehouses',
    'batches', 'stock_levels', 'stock_movements', 'stock_counts', 'stock_count_lines',
    'boms', 'bom_items', 'production_orders', 'production_consumption', 'assets',
    'asset_assignments', 'asset_maintenance', 'promos', 'promo_rules', 'promo_scopes',
    'orders', 'order_items', 'promo_redemptions', 'sales_transactions',
    'sales_transaction_items', 'sales_targets', 'expense_categories',
    'expense_reports', 'expenses', 'invoices', 'invoice_items', 'payments',
    'payment_allocations', 'remittances', 'forms', 'form_fields', 'form_submissions',
    'service_tickets', 'ticket_comments', 'data_jobs', 'report_definitions',
    'report_schedules', 'report_runs', 'dashboard_layouts', 'announcements',
    'announcement_reads', 'activity_feed', 'comments', 'attachments'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Special tables
-- ---------------------------------------------------------------------------
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select to authenticated
  using (id = public.current_org_id() or public.is_super_admin());

drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
  for update to authenticated
  using (id = public.current_org_id() and public.has_permission('administration', 'update'))
  with check (id = public.current_org_id() and public.has_permission('administration', 'update'));

drop policy if exists organizations_delete on public.organizations;
create policy organizations_delete on public.organizations
  for delete to authenticated
  using (public.is_super_admin());

drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select to authenticated
  using (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.has_permission('administration', 'view'))
  );

drop policy if exists users_insert on public.users;
create policy users_insert on public.users
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('administration', 'create'));

drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update to authenticated
  using (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.has_permission('administration', 'update'))
  )
  with check (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.has_permission('administration', 'update'))
  );

drop policy if exists users_delete on public.users;
create policy users_delete on public.users
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('administration', 'delete'));

drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
  for select to authenticated
  using (true);

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid() and org_id = public.current_org_id());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (user_id = auth.uid() and org_id = public.current_org_id());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid() and org_id = public.current_org_id())
  with check (user_id = auth.uid() and org_id = public.current_org_id());

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = auth.uid() and org_id = public.current_org_id());

drop policy if exists dashboard_layouts_select on public.dashboard_layouts;
create policy dashboard_layouts_select on public.dashboard_layouts
  for select to authenticated
  using (
    org_id = public.current_org_id()
    and (
      user_id = auth.uid()
      or user_id is null
      or role_id = any (public.current_role_ids())
      or public.has_permission('dashboard', 'update')
    )
  );

drop policy if exists dashboard_layouts_insert on public.dashboard_layouts;
create policy dashboard_layouts_insert on public.dashboard_layouts
  for insert to authenticated
  with check (
    org_id = public.current_org_id()
    and (
      (user_id = auth.uid() and (role_id is null or role_id = any (public.current_role_ids())))
      or public.has_permission('dashboard', 'create')
    )
  );

drop policy if exists dashboard_layouts_update on public.dashboard_layouts;
create policy dashboard_layouts_update on public.dashboard_layouts
  for update to authenticated
  using (
    org_id = public.current_org_id()
    and (
      user_id = auth.uid()
      or public.has_permission('dashboard', 'update')
    )
  )
  with check (
    org_id = public.current_org_id()
    and (
      user_id = auth.uid()
      or public.has_permission('dashboard', 'update')
    )
  );

drop policy if exists dashboard_layouts_delete on public.dashboard_layouts;
create policy dashboard_layouts_delete on public.dashboard_layouts
  for delete to authenticated
  using (
    org_id = public.current_org_id()
    and (
      user_id = auth.uid()
      or public.has_permission('dashboard', 'delete')
    )
  );

drop policy if exists report_definitions_select on public.report_definitions;
create policy report_definitions_select on public.report_definitions
  for select to authenticated
  using (
    org_id is null
    or (org_id = public.current_org_id() and public.has_permission('reports', 'view'))
  );

drop policy if exists report_definitions_insert on public.report_definitions;
create policy report_definitions_insert on public.report_definitions
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('reports', 'create'));

drop policy if exists report_definitions_update on public.report_definitions;
create policy report_definitions_update on public.report_definitions
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('reports', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('reports', 'update'));

drop policy if exists report_definitions_delete on public.report_definitions;
create policy report_definitions_delete on public.report_definitions
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('reports', 'delete'));

-- ---------------------------------------------------------------------------
-- Tenant-scoped tables (all have org_id)
-- ---------------------------------------------------------------------------
do $$
declare
  m record;
begin
  for m in
    select * from (values
      ('administration', 'roles'),
      ('administration', 'audit_logs'),
      ('administration', 'approval_workflows'),
      ('approvals', 'approvals'),
      ('master_data', 'master_data_types'),
      ('master_data', 'territories'),
      ('master_data', 'uoms'),
      ('master_data', 'tax_rates'),
      ('employees', 'departments'),
      ('employees', 'positions'),
      ('employees', 'employees'),
      ('attendance', 'shifts'),
      ('attendance', 'attendances'),
      ('leaves', 'leave_types'),
      ('leaves', 'leaves'),
      ('leaves', 'holidays'),
      ('accounts', 'accounts'),
      ('accounts', 'contacts'),
      ('leads', 'leads'),
      ('opportunities', 'pipeline_stages'),
      ('opportunities', 'opportunities'),
      ('activities', 'activities'),
      ('outlets', 'outlets'),
      ('visits', 'routes'),
      ('visits', 'visits'),
      ('tracking', 'location_pings'),
      ('tracking', 'geofences'),
      ('products', 'product_categories'),
      ('products', 'products'),
      ('products', 'price_lists'),
      ('inventory', 'warehouses'),
      ('inventory', 'stock_movements'),
      ('inventory', 'stock_counts'),
      ('production', 'boms'),
      ('production', 'production_orders'),
      ('assets', 'assets'),
      ('promos', 'promos'),
      ('orders', 'orders'),
      ('sales', 'sales_transactions'),
      ('sales', 'sales_targets'),
      ('expenses', 'expense_categories'),
      ('expenses', 'expense_reports'),
      ('expenses', 'expenses'),
      ('billing', 'invoices'),
      ('billing', 'payments'),
      ('billing', 'remittances'),
      ('forms', 'forms'),
      ('forms', 'form_submissions'),
      ('tickets', 'service_tickets'),
      ('data_jobs', 'data_jobs'),
      ('reports', 'report_schedules'),
      ('reports', 'report_runs'),
      ('announcements', 'announcements'),
      ('activity', 'activity_feed'),
      ('activity', 'comments'),
      ('attachments', 'attachments')
    ) as v(module, table_name)
  loop
    execute format('drop policy if exists tenant_select on public.%I', m.table_name);
    execute format(
      'create policy tenant_select on public.%I for select to authenticated using (org_id = public.current_org_id() and public.has_permission(%L, %L))',
      m.table_name, m.module, 'view'
    );

    execute format('drop policy if exists tenant_insert on public.%I', m.table_name);
    execute format(
      'create policy tenant_insert on public.%I for insert to authenticated with check (org_id = public.current_org_id() and public.has_permission(%L, %L))',
      m.table_name, m.module, 'create'
    );

    execute format('drop policy if exists tenant_update on public.%I', m.table_name);
    execute format(
      'create policy tenant_update on public.%I for update to authenticated using (org_id = public.current_org_id() and public.has_permission(%L, %L)) with check (org_id = public.current_org_id() and public.has_permission(%L, %L))',
      m.table_name, m.module, 'update', m.module, 'update'
    );

    execute format('drop policy if exists tenant_delete on public.%I', m.table_name);
    execute format(
      'create policy tenant_delete on public.%I for delete to authenticated using (org_id = public.current_org_id() and public.has_permission(%L, %L))',
      m.table_name, m.module, 'delete'
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Child tables (no org_id): inherit the tenant and module from their parent.
-- ---------------------------------------------------------------------------
do $$
declare
  m record;
begin
  for m in
    select * from (values
      ('master_data_items', 'master_data_types', 'type_id', 'master_data'),
      ('employee_documents', 'employees', 'employee_id', 'employees'),
      ('employee_shifts', 'employees', 'employee_id', 'attendance'),
      ('leave_balances', 'employees', 'employee_id', 'leaves'),
      ('route_stops', 'routes', 'route_id', 'visits'),
      ('visit_photos', 'visits', 'visit_id', 'visits'),
      ('product_uom_conversions', 'products', 'product_id', 'products'),
      ('price_list_items', 'price_lists', 'price_list_id', 'products'),
      ('batches', 'products', 'product_id', 'products'),
      ('stock_levels', 'warehouses', 'warehouse_id', 'inventory'),
      ('stock_count_lines', 'stock_counts', 'count_id', 'inventory'),
      ('bom_items', 'boms', 'bom_id', 'production'),
      ('production_consumption', 'production_orders', 'production_order_id', 'production'),
      ('asset_assignments', 'assets', 'asset_id', 'assets'),
      ('asset_maintenance', 'assets', 'asset_id', 'assets'),
      ('promo_rules', 'promos', 'promo_id', 'promos'),
      ('promo_scopes', 'promos', 'promo_id', 'promos'),
      ('order_items', 'orders', 'order_id', 'orders'),
      ('promo_redemptions', 'promos', 'promo_id', 'promos'),
      ('sales_transaction_items', 'sales_transactions', 'txn_id', 'sales'),
      ('invoice_items', 'invoices', 'invoice_id', 'billing'),
      ('payment_allocations', 'payments', 'payment_id', 'billing'),
      ('form_fields', 'forms', 'form_id', 'forms'),
      ('ticket_comments', 'service_tickets', 'ticket_id', 'tickets'),
      ('role_permissions', 'roles', 'role_id', 'administration'),
      ('user_roles', 'users', 'user_id', 'administration'),
      ('announcement_reads', 'announcements', 'announcement_id', 'announcements')
    ) as v(child_table, parent_table, child_fk, module)
  loop
    execute format('drop policy if exists tenant_select on public.%I', m.child_table);
    execute format(
      'create policy tenant_select on public.%I for select to authenticated using (exists (select 1 from public.%I p where p.id = public.%I.%I and p.org_id = public.current_org_id()) and public.has_permission(%L, %L))',
      m.child_table, m.parent_table, m.child_table, m.child_fk, m.module, 'view'
    );

    execute format('drop policy if exists tenant_insert on public.%I', m.child_table);
    execute format(
      'create policy tenant_insert on public.%I for insert to authenticated with check (exists (select 1 from public.%I p where p.id = public.%I.%I and p.org_id = public.current_org_id()) and public.has_permission(%L, %L))',
      m.child_table, m.parent_table, m.child_table, m.child_fk, m.module, 'create'
    );

    execute format('drop policy if exists tenant_update on public.%I', m.child_table);
    execute format(
      'create policy tenant_update on public.%I for update to authenticated using (exists (select 1 from public.%I p where p.id = public.%I.%I and p.org_id = public.current_org_id()) and public.has_permission(%L, %L)) with check (exists (select 1 from public.%I p where p.id = public.%I.%I and p.org_id = public.current_org_id()) and public.has_permission(%L, %L))',
      m.child_table,
      m.parent_table, m.child_table, m.child_fk, m.module, 'update',
      m.parent_table, m.child_table, m.child_fk, m.module, 'update'
    );

    execute format('drop policy if exists tenant_delete on public.%I', m.child_table);
    execute format(
      'create policy tenant_delete on public.%I for delete to authenticated using (exists (select 1 from public.%I p where p.id = public.%I.%I and p.org_id = public.current_org_id()) and public.has_permission(%L, %L))',
      m.child_table, m.parent_table, m.child_table, m.child_fk, m.module, 'delete'
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Read receipts: any member who can view announcements may mark one read,
-- even without create/update rights on the announcements module.
-- ---------------------------------------------------------------------------
drop policy if exists tenant_insert on public.announcement_reads;
create policy tenant_insert on public.announcement_reads
  for insert to authenticated
  with check (
    exists (
      select 1 from public.announcements p
      where p.id = announcement_reads.announcement_id
        and p.org_id = public.current_org_id()
    )
    and public.has_permission('announcements', 'view')
  );

drop policy if exists tenant_update on public.announcement_reads;
create policy tenant_update on public.announcement_reads
  for update to authenticated
  using (
    exists (
      select 1 from public.announcements p
      where p.id = announcement_reads.announcement_id
        and p.org_id = public.current_org_id()
    )
    and public.has_permission('announcements', 'view')
  )
  with check (
    exists (
      select 1 from public.announcements p
      where p.id = announcement_reads.announcement_id
        and p.org_id = public.current_org_id()
    )
    and public.has_permission('announcements', 'view')
  );

drop policy if exists tenant_delete on public.announcement_reads;
create policy tenant_delete on public.announcement_reads
  for delete to authenticated
  using (
    exists (
      select 1 from public.announcements p
      where p.id = announcement_reads.announcement_id
        and p.org_id = public.current_org_id()
    )
    and public.has_permission('announcements', 'view')
  );

-- ---------------------------------------------------------------------------
-- API grants and hardened function permissions
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;

alter default privileges in schema public grant all on tables to authenticated, service_role;
alter default privileges in schema public grant all on sequences to authenticated, service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;

revoke all on function public.bootstrap_organization(text, text, text, text) from public, anon;
grant execute on function public.bootstrap_organization(text, text, text, text) to authenticated;
