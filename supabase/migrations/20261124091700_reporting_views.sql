-- ============================================================================
-- Curated reporting views for the Reports Builder.
-- security_invoker = true makes the caller's RLS apply to the base tables.
-- ============================================================================

create or replace view public.rpt_attendance_daily
with (security_invoker = true) as
select
  a.org_id,
  a.work_date,
  a.employee_id,
  e.employee_no,
  e.first_name || ' ' || e.last_name as employee_name,
  a.status,
  a.clock_in_at,
  a.clock_out_at,
  a.late_minutes,
  a.overtime_minutes,
  round(extract(epoch from (a.clock_out_at - a.clock_in_at)) / 3600.0, 2) as hours_worked
from public.attendances a
join public.employees e on e.id = a.employee_id;

create or replace view public.rpt_visit_compliance
with (security_invoker = true) as
select
  v.org_id,
  v.planned_date,
  v.employee_id,
  e.employee_no,
  e.first_name || ' ' || e.last_name as employee_name,
  count(*) as planned_visits,
  count(*) filter (where v.status = 'completed') as completed_visits,
  count(*) filter (where v.status in ('skipped', 'missed')) as missed_visits,
  case
    when count(*) = 0 then 0
    else round(100.0 * count(*) filter (where v.status = 'completed') / count(*), 2)
  end as compliance_pct
from public.visits v
join public.employees e on e.id = v.employee_id
where v.planned_date is not null
group by v.org_id, v.planned_date, v.employee_id, e.employee_no, e.first_name, e.last_name;

create or replace view public.rpt_sales_by_outlet
with (security_invoker = true) as
select
  st.org_id,
  date_trunc('day', st.txn_date)::date as sales_date,
  st.outlet_id,
  o.name as outlet_name,
  count(*) as txn_count,
  sum(st.total_amount) as total_amount
from public.sales_transactions st
left join public.outlets o on o.id = st.outlet_id
where st.txn_type = 'sale'
group by st.org_id, date_trunc('day', st.txn_date)::date, st.outlet_id, o.name;

create or replace view public.rpt_sales_by_rep
with (security_invoker = true) as
select
  st.org_id,
  date_trunc('day', st.txn_date)::date as sales_date,
  st.salesperson_id,
  e.employee_no,
  e.first_name || ' ' || e.last_name as employee_name,
  count(*) as txn_count,
  sum(st.total_amount) as total_amount
from public.sales_transactions st
left join public.employees e on e.id = st.salesperson_id
where st.txn_type = 'sale'
group by st.org_id, date_trunc('day', st.txn_date)::date, st.salesperson_id, e.employee_no, e.first_name, e.last_name;

create or replace view public.rpt_stock_on_hand
with (security_invoker = true) as
select
  w.org_id,
  sl.warehouse_id,
  w.name as warehouse_name,
  sl.product_id,
  p.sku,
  p.name as product_name,
  b.batch_no,
  b.expiry_date,
  sl.on_hand,
  sl.reserved,
  sl.available,
  sl.reorder_level
from public.stock_levels sl
join public.warehouses w on w.id = sl.warehouse_id
join public.products p on p.id = sl.product_id
left join public.batches b on b.id = sl.batch_id;

create or replace view public.rpt_receivables_aging
with (security_invoker = true) as
select
  i.org_id,
  i.account_id,
  a.name as account_name,
  i.id as invoice_id,
  i.invoice_no,
  i.invoice_date,
  i.due_date,
  i.total,
  i.amount_paid,
  (i.total - i.amount_paid) as balance,
  greatest(0, current_date - i.due_date) as days_overdue,
  case
    when current_date <= i.due_date then 'current'
    when current_date - i.due_date <= 30 then '1-30'
    when current_date - i.due_date <= 60 then '31-60'
    when current_date - i.due_date <= 90 then '61-90'
    else '90+'
  end as aging_bucket
from public.invoices i
join public.accounts a on a.id = i.account_id
where i.status in ('open', 'partially_paid', 'overdue')
  and i.total > i.amount_paid;

create or replace view public.rpt_expense_summary
with (security_invoker = true) as
select
  e.org_id,
  date_trunc('month', e.expense_date)::date as month,
  e.employee_id,
  emp.employee_no,
  emp.first_name || ' ' || emp.last_name as employee_name,
  ec.name as category,
  e.status,
  count(*) as expense_count,
  sum(e.amount) as total_amount
from public.expenses e
join public.employees emp on emp.id = e.employee_id
join public.expense_categories ec on ec.id = e.category_id
group by e.org_id, date_trunc('month', e.expense_date)::date, e.employee_id,
         emp.employee_no, emp.first_name, emp.last_name, ec.name, e.status;

create or replace view public.rpt_order_pipeline
with (security_invoker = true) as
select
  o.org_id,
  o.order_date,
  o.status,
  count(*) as order_count,
  sum(o.grand_total) as total_value
from public.orders o
group by o.org_id, o.order_date, o.status;

grant select on
  public.rpt_attendance_daily,
  public.rpt_visit_compliance,
  public.rpt_sales_by_outlet,
  public.rpt_sales_by_rep,
  public.rpt_stock_on_hand,
  public.rpt_receivables_aging,
  public.rpt_expense_summary,
  public.rpt_order_pipeline
to authenticated, service_role;
