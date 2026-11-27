-- Lead source master table, replacing the generic master_data lead_source type.
create table public.lead_sources (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

alter table public.lead_sources enable row level security;

create policy tenant_select on public.lead_sources
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'view'));
create policy tenant_insert on public.lead_sources
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('leads', 'create'));
create policy tenant_update on public.lead_sources
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('leads', 'update'));
create policy tenant_delete on public.lead_sources
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'delete'));

create trigger set_updated_at before update on public.lead_sources
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.lead_sources
  for each row execute function public.audit_trigger('leads');

grant all on public.lead_sources to authenticated, service_role;

create or replace function public.seed_lead_sources(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.lead_sources (org_id, code, name, description, sort_order)
  select p_org, v.code, v.name, v.description, v.sort_order
  from (values
    ('walk_in', 'Walk-in', 'Walk-in customer', 1),
    ('referral', 'Referral', 'Referred by a customer or partner', 2),
    ('cold_call', 'Cold Call', 'Outbound cold call', 3),
    ('digital', 'Digital', 'Website, social media or online ads', 4),
    ('trade_show', 'Trade Show', 'Event or trade show', 5)
  ) as v(code, name, description, sort_order)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_lead_sources_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_lead_sources(new.id);
  return new;
end;
$$;

drop trigger if exists seed_lead_sources on public.organizations;
create trigger seed_lead_sources after insert on public.organizations
  for each row execute function public.seed_lead_sources_on_organization();

select public.seed_lead_sources(id) from public.organizations;

alter table public.leads add column if not exists source_id uuid references public.lead_sources (id) on delete set null;

update public.leads l
   set source_id = s.id
  from public.lead_sources s
 where s.org_id = l.org_id
   and s.code = l.source
   and l.source_id is null;

alter table public.leads drop column if exists source;
