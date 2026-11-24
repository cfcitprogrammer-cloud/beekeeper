-- ============================================================================
-- Seed: global permission catalogue and prebuilt system reports.
-- Organization-scoped defaults are seeded by public.bootstrap_organization().
-- ============================================================================

insert into public.permissions (module, action)
select m.module, a.action
from (values
  ('administration'),
  ('approvals'),
  ('master_data'),
  ('employees'),
  ('attendance'),
  ('leaves'),
  ('accounts'),
  ('leads'),
  ('opportunities'),
  ('activities'),
  ('outlets'),
  ('visits'),
  ('tracking'),
  ('products'),
  ('inventory'),
  ('production'),
  ('assets'),
  ('promos'),
  ('orders'),
  ('sales'),
  ('expenses'),
  ('billing'),
  ('forms'),
  ('tickets'),
  ('data_jobs'),
  ('reports'),
  ('dashboard'),
  ('announcements'),
  ('activity'),
  ('attachments')
) as m(module)
cross join (values
  ('view'),
  ('create'),
  ('update'),
  ('delete'),
  ('approve'),
  ('export')
) as a(action)
on conflict (module, action) do nothing;

insert into public.report_definitions (org_id, name, description, data_source, config, is_system, visibility)
select
  null,
  v.name,
  v.description,
  v.data_source,
  v.config::jsonb,
  true,
  'org'
from (values
  (
    'Attendance Daily',
    'Daily clock-in / clock-out summary per employee.',
    'rpt_attendance_daily',
    '{"columns":["work_date","employee_no","employee_name","status","clock_in_at","clock_out_at","late_minutes","hours_worked"],"chart":"table"}'
  ),
  (
    'Visit Compliance',
    'Planned versus completed visits per employee and day.',
    'rpt_visit_compliance',
    '{"columns":["planned_date","employee_no","employee_name","planned_visits","completed_visits","missed_visits","compliance_pct"],"chart":"bar"}'
  ),
  (
    'Sales by Outlet',
    'Net sales grouped by outlet and day.',
    'rpt_sales_by_outlet',
    '{"columns":["sales_date","outlet_name","txn_count","total_amount"],"chart":"bar"}'
  ),
  (
    'Sales by Representative',
    'Net sales grouped by salesperson and day.',
    'rpt_sales_by_rep',
    '{"columns":["sales_date","employee_no","employee_name","txn_count","total_amount"],"chart":"bar"}'
  ),
  (
    'Stock On Hand',
    'Current stock levels by warehouse, product and batch.',
    'rpt_stock_on_hand',
    '{"columns":["warehouse_name","sku","product_name","batch_no","on_hand","reserved","available","reorder_level"],"chart":"table"}'
  ),
  (
    'Receivables Aging',
    'Open invoice balances with aging buckets.',
    'rpt_receivables_aging',
    '{"columns":["account_name","invoice_no","due_date","balance","days_overdue","aging_bucket"],"chart":"table"}'
  ),
  (
    'Expense Summary',
    'Approved and submitted expenses by employee and category.',
    'rpt_expense_summary',
    '{"columns":["month","employee_no","employee_name","category","status","expense_count","total_amount"],"chart":"bar"}'
  ),
  (
    'Order Pipeline',
    'Order count and value by status and order date.',
    'rpt_order_pipeline',
    '{"columns":["order_date","status","order_count","total_value"],"chart":"bar"}'
  )
) as v(name, description, data_source, config)
where not exists (
  select 1
  from public.report_definitions rd
  where rd.is_system = true and rd.name = v.name
);
