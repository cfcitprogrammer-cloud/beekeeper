-- Expense items can be marked as reimbursable.
alter table public.expenses
  add column if not exists is_reimbursable boolean not null default true;
