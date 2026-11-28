-- Rename the opportunity fields to match their labels, and add the remaining
-- pipeline fields. The linked lead is no longer stored on opportunities.
alter table public.opportunities rename column name to opportunity_name;
alter table public.opportunities rename column expected_close to close_date;
alter table public.opportunities drop column if exists lead_id;

alter table public.opportunities add column if not exists email text;
alter table public.opportunities add column if not exists quantity int;
alter table public.opportunities add column if not exists source_id uuid references public.lead_sources (id) on delete set null;
alter table public.opportunities add column if not exists description text;

create index opportunities_source_idx on public.opportunities (source_id);
