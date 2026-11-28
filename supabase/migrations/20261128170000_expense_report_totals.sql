-- Expense report totals are derived from their expense items.
alter table public.expense_reports rename column total_amount to total_expense;
alter table public.expense_reports add column if not exists total_reimbursable numeric(14, 2) not null default 0;
alter table public.expense_reports add column if not exists approved_amount numeric(14, 2) not null default 0;

create or replace function public.refresh_expense_report_totals(p_report uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.expense_reports r
     set total_expense = coalesce((
           select sum(e.amount) from public.expenses e where e.report_id = p_report
         ), 0),
         total_reimbursable = coalesce((
           select sum(e.amount)
             from public.expenses e
            where e.report_id = p_report and e.is_reimbursable
         ), 0),
         approved_amount = coalesce((
           select sum(e.amount)
             from public.expenses e
            where e.report_id = p_report and e.status = 'approved'
         ), 0),
         updated_at = now()
   where r.id = p_report;
end;
$$;

create or replace function public.refresh_expense_report_totals_on_item()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.report_id is not null then
    perform public.refresh_expense_report_totals(old.report_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.report_id is not null then
    perform public.refresh_expense_report_totals(new.report_id);
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists refresh_expense_report_totals on public.expenses;
create trigger refresh_expense_report_totals
  after insert or update or delete on public.expenses
  for each row execute function public.refresh_expense_report_totals_on_item();

-- Backfill reports that already have items.
select public.refresh_expense_report_totals(id) from public.expense_reports;
