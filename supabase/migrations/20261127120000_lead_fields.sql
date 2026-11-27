-- Lead stages master data, split name into first/last, and new lead fields.
create table public.lead_stages (
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

alter table public.lead_stages enable row level security;

create policy tenant_select on public.lead_stages
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'view'));
create policy tenant_insert on public.lead_stages
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('leads', 'create'));
create policy tenant_update on public.lead_stages
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('leads', 'update'));
create policy tenant_delete on public.lead_stages
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('leads', 'delete'));

create trigger set_updated_at before update on public.lead_stages
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.lead_stages
  for each row execute function public.audit_trigger('leads');

grant all on public.lead_stages to authenticated, service_role;

create or replace function public.seed_lead_stages(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.lead_stages (org_id, code, name, description, sort_order)
  select p_org, v.code, v.name, v.description, v.sort_order
  from (values
    ('NEW', 'New', 'Newly captured lead', 1),
    ('CONT', 'Contacted', 'First contact made', 2),
    ('QUAL', 'Qualified', 'Lead meets qualification criteria', 3),
    ('UNQ', 'Unqualified', 'Lead did not qualify', 4),
    ('CONV', 'Converted', 'Lead converted to account', 5)
  ) as v(code, name, description, sort_order)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_lead_stages_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_lead_stages(new.id);
  return new;
end;
$$;

drop trigger if exists seed_lead_stages on public.organizations;
create trigger seed_lead_stages after insert on public.organizations
  for each row execute function public.seed_lead_stages_on_organization();

select public.seed_lead_stages(id) from public.organizations;

alter table public.leads add column if not exists stage_id uuid references public.lead_stages (id) on delete set null;
alter table public.leads add column if not exists first_name text;
alter table public.leads add column if not exists last_name text;
alter table public.leads add column if not exists title text;
alter table public.leads add column if not exists industry text;
alter table public.leads add column if not exists country text;
alter table public.leads add column if not exists region text;
alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists postal_code text;
alter table public.leads add column if not exists remarks text;

update public.leads l
   set first_name = split_part(l.name, ' ', 1),
       last_name = nullif(substring(l.name from position(' ' in l.name) + 1), '')
 where l.first_name is null;

update public.leads l
   set stage_id = s.id
  from public.lead_stages s
 where s.org_id = l.org_id
   and s.code = case l.status
     when 'new' then 'NEW'
     when 'contacted' then 'CONT'
     when 'qualified' then 'QUAL'
     when 'unqualified' then 'UNQ'
     when 'converted' then 'CONV'
   end
   and l.stage_id is null;

drop index if exists public.leads_owner_idx;
create index leads_owner_idx on public.leads (owner_id);

alter table public.leads alter column first_name set not null;
alter table public.leads drop column if exists name;
alter table public.leads drop column if exists status;
