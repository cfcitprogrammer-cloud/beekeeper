-- ============================================================================
-- TOOLS: digital forms and service tickets
-- ============================================================================

create table public.forms (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  name       text not null,
  form_type  text,
  version    int not null default 1,
  status     text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  schema     jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_fields (
  id          uuid primary key default gen_random_uuid(),
  form_id     uuid not null references public.forms (id) on delete cascade,
  key         text not null,
  label       text not null,
  field_type  text not null,
  is_required boolean not null default false,
  options     jsonb,
  logic       jsonb,
  sort_order  int not null default 0,
  unique (form_id, key)
);

create table public.form_submissions (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  form_id      uuid not null references public.forms (id) on delete cascade,
  form_version int not null,
  submitted_by uuid not null references public.employees (id),
  visit_id     uuid references public.visits (id) on delete set null,
  outlet_id    uuid references public.outlets (id) on delete set null,
  ticket_id    uuid,
  answers      jsonb not null,
  location     extensions.geography(point, 4326),
  submitted_at timestamptz not null default now(),
  synced_at    timestamptz
);

create index form_submissions_form_idx on public.form_submissions (form_id, submitted_at desc);
create index form_submissions_answers_idx on public.form_submissions using gin (answers);

create table public.service_tickets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  ticket_no   text not null,
  title       text not null,
  description text,
  category    text,
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status      text not null default 'open'
              check (status in ('open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed')),
  account_id  uuid references public.accounts (id) on delete set null,
  outlet_id   uuid references public.outlets (id) on delete set null,
  asset_id    uuid references public.assets (id) on delete set null,
  product_id  uuid references public.products (id) on delete set null,
  reported_by uuid references public.users (id) on delete set null,
  assigned_to uuid references public.employees (id) on delete set null,
  sla_due_at  timestamptz,
  resolved_at timestamptz,
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, ticket_no)
);

create index service_tickets_status_idx on public.service_tickets (org_id, status, priority);
create index service_tickets_assigned_idx on public.service_tickets (assigned_to, status);

alter table public.form_submissions
  add constraint form_submissions_ticket_fk
  foreign key (ticket_id) references public.service_tickets (id) on delete set null;

create table public.ticket_comments (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.service_tickets (id) on delete cascade,
  author_id   uuid not null references public.users (id) on delete cascade,
  body        text not null,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);

create index ticket_comments_ticket_idx on public.ticket_comments (ticket_id, created_at);
