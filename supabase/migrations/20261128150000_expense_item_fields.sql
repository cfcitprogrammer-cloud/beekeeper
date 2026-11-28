-- Expense items: date range, outlet link and attachment; remove unused fields.
alter table public.expenses rename column expense_date to date_from;
alter table public.expenses add column if not exists date_to date;
alter table public.expenses add column if not exists outlet_id uuid references public.outlets (id) on delete set null;
alter table public.expenses add column if not exists attachment_path text;

alter table public.expenses drop column if exists currency_code;
alter table public.expenses drop column if exists receipt_url;
alter table public.expenses drop column if exists visit_id;
alter table public.expenses drop column if exists distance_km;

create index expenses_outlet_idx on public.expenses (outlet_id);

-- Keep the reporting view in sync with the renamed date column.
create or replace view public.rpt_expense_summary
with (security_invoker = true) as
select
  e.org_id,
  date_trunc('month', e.date_from)::date as month,
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
group by e.org_id, date_trunc('month', e.date_from)::date, e.employee_id,
         emp.employee_no, emp.first_name, emp.last_name, ec.name, e.status;
