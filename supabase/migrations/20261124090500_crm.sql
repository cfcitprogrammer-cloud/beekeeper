-- ============================================================================
-- SALES & CRM: accounts, contacts, leads, pipeline, opportunities, activities
-- ============================================================================

create table public.accounts (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations (id) on delete cascade,
  account_no        text not null,
  name              text not null,
  legal_name        text,
  tax_id            text,
  account_type      text,
  owner_id          uuid references public.employees (id) on delete set null,
  price_list_id     uuid,
  payment_term_days int not null default 0,
  credit_limit      numeric(14, 2) not null default 0,
  billing_address   jsonb,
  shipping_address  jsonb,
  status            text not null default 'active'
                    check (status in ('prospect', 'active', 'inactive', 'blocked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (org_id, account_no)
);

create index accounts_owner_idx on public.accounts (owner_id);

create table public.contacts (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete cascade,
  first_name text not null,
  last_name  text,
  title      text,
  email      text,
  phone      text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_account_idx on public.contacts (account_id);

create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.organizations (id) on delete cascade,
  name                 text not null,
  company              text,
  email                text,
  phone                text,
  source               text,
  owner_id             uuid references public.employees (id) on delete set null,
  status               text not null default 'new'
                       check (status in ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  score                int,
  location             extensions.geography(point, 4326),
  converted_account_id uuid references public.accounts (id) on delete set null,
  converted_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index leads_owner_idx on public.leads (owner_id, status);

create table public.pipeline_stages (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  sort_order  int not null,
  probability numeric(5, 2) not null default 0,
  is_won      boolean not null default false,
  is_lost     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.opportunities (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations (id) on delete cascade,
  account_id     uuid not null references public.accounts (id) on delete cascade,
  lead_id        uuid references public.leads (id) on delete set null,
  name           text not null,
  stage_id       uuid not null references public.pipeline_stages (id),
  amount         numeric(14, 2) not null default 0,
  expected_close date,
  owner_id       uuid references public.employees (id) on delete set null,
  lost_reason    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index opportunities_account_idx on public.opportunities (account_id);
create index opportunities_stage_idx on public.opportunities (stage_id);
create index opportunities_owner_idx on public.opportunities (owner_id);

create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  entity_type text not null,
  entity_id   uuid not null,
  type        text not null,
  subject     text,
  notes       text,
  due_at      timestamptz,
  done_at     timestamptz,
  owner_id    uuid references public.employees (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index activities_entity_idx on public.activities (entity_type, entity_id);
create index activities_owner_idx on public.activities (owner_id, due_at);
