-- Business development funds are split into line items and reports.
drop table if exists public.business_development_funds;

create table public.bdf_areas (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

create table public.bdf_categories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  code        text not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, code)
);

create table public.bdf_reports (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  outlet_id   uuid references public.outlets (id) on delete set null,
  area_id     uuid references public.bdf_areas (id) on delete set null,
  date_from   date not null,
  date_to     date,
  account_id  uuid references public.accounts (id) on delete set null,
  address     text,
  employee_id uuid not null references public.employees (id),
  category_id uuid references public.bdf_categories (id) on delete set null,
  -- Uploaded object paths; mirrored into public.attachments by the sync trigger.
  attachment_paths jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.bdf_items (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  report_id    uuid not null references public.bdf_reports (id) on delete cascade,
  employee_id  uuid not null references public.employees (id),
  particular   text not null,
  qty          numeric(12, 2) not null default 1,
  unit_amount  numeric(14, 2) not null default 0,
  total_amount numeric(14, 2) generated always as (qty * unit_amount) stored,
  date         date not null,
  remarks      text,
  attachment_path text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index bdf_reports_employee_idx on public.bdf_reports (employee_id, date_from desc);
create index bdf_items_report_idx on public.bdf_items (report_id);

-- Mirror the uploaded object paths into the shared attachments table so the
-- existing attachment views and storage policies keep working.
create or replace function public.sync_bdf_report_attachments()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.attachments
     where entity_type = 'bdf_reports' and entity_id = old.id;
    return old;
  end if;

  delete from public.attachments
   where entity_type = 'bdf_reports' and entity_id = new.id;

  if new.attachment_paths is not null and jsonb_array_length(new.attachment_paths) > 0 then
    insert into public.attachments (org_id, entity_type, entity_id, file_name, mime_type, storage_url, uploaded_by)
    select new.org_id,
           'bdf_reports',
           new.id,
           split_part(item.path, '/', 4),
           null,
           item.path,
           (select id from public.users where id = auth.uid())
      from jsonb_array_elements_text(new.attachment_paths) as item(path);
  end if;

  return new;
end;
$$;

create trigger sync_bdf_report_attachments
  after insert or update or delete on public.bdf_reports
  for each row execute function public.sync_bdf_report_attachments();

do $$
declare
  t text;
begin
  foreach t in array array['bdf_areas', 'bdf_categories', 'bdf_reports', 'bdf_items'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy tenant_select on public.%I for select to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''view''))',
      t
    );
    execute format(
      'create policy tenant_insert on public.%I for insert to authenticated with check (org_id = public.current_org_id() and public.has_permission(''expenses'', ''create''))',
      t
    );
    execute format(
      'create policy tenant_update on public.%I for update to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''update'')) with check (org_id = public.current_org_id() and public.has_permission(''expenses'', ''update''))',
      t
    );
    execute format(
      'create policy tenant_delete on public.%I for delete to authenticated using (org_id = public.current_org_id() and public.has_permission(''expenses'', ''delete''))',
      t
    );

    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
    execute format(
      'create trigger write_audit after insert or update or delete on public.%I for each row execute function public.audit_trigger(''expenses'')',
      t
    );
    execute format('grant all on public.%I to authenticated, service_role', t);
  end loop;
end $$;

create or replace function public.seed_bdf_masters(p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.bdf_areas (org_id, code, name, sort_order)
  values (p_org, 'unassigned', 'Unassigned', 1)
  on conflict (org_id, code) do nothing;

  insert into public.bdf_categories (org_id, code, name, sort_order)
  values (p_org, 'general', 'General', 1)
  on conflict (org_id, code) do nothing;
end;
$$;

create or replace function public.seed_bdf_masters_on_organization()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.seed_bdf_masters(new.id);
  return new;
end;
$$;

drop trigger if exists seed_bdf_masters on public.organizations;
create trigger seed_bdf_masters after insert on public.organizations
  for each row execute function public.seed_bdf_masters_on_organization();

select public.seed_bdf_masters(id) from public.organizations;
