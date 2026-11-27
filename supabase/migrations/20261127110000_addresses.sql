-- Account addresses: billing/shipping records linked to an account.
create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  account_id   uuid not null references public.accounts (id) on delete cascade,
  address_type text not null check (address_type in ('billing', 'shipping', 'both')),
  label        text,
  line1        text not null,
  line2        text,
  barangay     text,
  city         text not null,
  province     text,
  postal_code  text,
  country_code char(2) not null default 'PH',
  location     extensions.geography(Point, 4326),
  contact_id   uuid references public.contacts (id) on delete set null,
  is_default   boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index addresses_account_idx on public.addresses (account_id);
create unique index one_default_address
  on public.addresses (account_id, address_type) where is_default;

alter table public.addresses enable row level security;

create policy tenant_select on public.addresses
  for select to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'view'));
create policy tenant_insert on public.addresses
  for insert to authenticated
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'create'));
create policy tenant_update on public.addresses
  for update to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'update'))
  with check (org_id = public.current_org_id() and public.has_permission('accounts', 'update'));
create policy tenant_delete on public.addresses
  for delete to authenticated
  using (org_id = public.current_org_id() and public.has_permission('accounts', 'delete'));

create trigger set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();
create trigger write_audit after insert or update or delete on public.addresses
  for each row execute function public.audit_trigger('accounts');

grant all on public.addresses to authenticated, service_role;
