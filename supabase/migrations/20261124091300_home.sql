-- ============================================================================
-- HOME: dashboard layouts, announcements, activity feed, comments, attachments
-- ============================================================================

create table public.dashboard_layouts (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations (id) on delete cascade,
  role_id    uuid references public.roles (id) on delete cascade,
  user_id    uuid references public.users (id) on delete cascade,
  widgets    jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  title        text not null,
  body         text not null,
  attachments  jsonb not null default '[]'::jsonb,
  audience     jsonb not null default '{}'::jsonb,
  is_pinned    boolean not null default false,
  requires_ack boolean not null default false,
  publish_at   timestamptz not null default now(),
  expires_at   timestamptz,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index announcements_org_publish_idx on public.announcements (org_id, publish_at desc);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  read_at         timestamptz not null default now(),
  acknowledged_at timestamptz,
  primary key (announcement_id, user_id)
);

create table public.activity_feed (
  id          bigserial primary key,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  actor_id    uuid references public.users (id) on delete set null,
  verb        text not null,
  entity_type text not null,
  entity_id   uuid not null,
  summary     text not null,
  audience    jsonb,
  created_at  timestamptz not null default now()
);

create index activity_feed_org_idx on public.activity_feed (org_id, created_at desc);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  entity_type text not null,
  entity_id   uuid not null,
  author_id   uuid not null references public.users (id) on delete cascade,
  body        text not null,
  mentions    uuid[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index comments_entity_idx on public.comments (entity_type, entity_id);

create table public.attachments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  entity_type text not null,
  entity_id   uuid not null,
  file_name   text not null,
  mime_type   text,
  size_bytes  bigint,
  storage_url text not null,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index attachments_entity_idx on public.attachments (entity_type, entity_id);
