-- Use a status field (active/inactive) on lead stages and lead sources.
alter table public.lead_stages
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));
update public.lead_stages
   set status = case when is_active then 'active' else 'inactive' end;
alter table public.lead_stages drop column if exists is_active;

alter table public.lead_sources
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));
update public.lead_sources
   set status = case when is_active then 'active' else 'inactive' end;
alter table public.lead_sources drop column if exists is_active;
