-- ============================================================================
-- SYSTEM: ADMINISTRATION
-- Authentication is delegated to Supabase Auth (auth.users). The public.users
-- table is the application profile / tenant membership record and is kept in
-- sync with auth.users by a trigger created in the next migration.
-- ============================================================================

create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,
  timezone      text not null default 'UTC',
  currency_code text not null default 'USD',
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.users (
  id             uuid primary key references auth.users (id) on delete cascade,
  org_id         uuid references public.organizations (id) on delete set null,
  email          text not null,
  full_name      text not null default '',
  avatar_url     text,
  phone          text,
  status         text not null default 'active'
                 check (status in ('active', 'suspended', 'invited')),
  is_super_admin boolean not null default false,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index users_org_email_key on public.users (org_id, lower(email));
create index users_org_idx on public.users (org_id);

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, name)
);

create table public.permissions (
  id     uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  unique (module, action)
);

create table public.role_permissions (
  role_id       uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  data_scope    text not null default 'own'
                check (data_scope in ('own', 'team', 'territory', 'org')),
  primary key (role_id, permission_id)
);

create table public.user_roles (
  user_id uuid not null references public.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  primary key (user_id, role_id)
);

create table public.audit_logs (
  id          bigserial primary key,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  user_id     uuid references public.users (id) on delete set null,
  module      text not null,
  entity_type text not null,
  entity_id   uuid,
  action      text not null,
  changes     jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index audit_logs_org_module_idx on public.audit_logs (org_id, module, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create table public.approval_workflows (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references public.organizations (id) on delete cascade,
  module    text not null,
  name      text not null,
  steps     jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.approvals (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  workflow_id uuid references public.approval_workflows (id) on delete set null,
  entity_type text not null,
  entity_id   uuid not null,
  level       int not null,
  approver_id uuid references public.users (id) on delete set null,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected', 'skipped')),
  remarks     text,
  acted_at    timestamptz,
  created_at  timestamptz not null default now()
);

create index approvals_entity_idx on public.approvals (entity_type, entity_id);
create index approvals_approver_idx on public.approvals (approver_id, status);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);
