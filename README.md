# Beekeeper ERP

Multi-tenant ERP and field-operations platform built with Next.js 16, React 19,
shadcn/ui and Supabase (PostgreSQL + PostGIS + Auth + Storage).

The product scope is defined in [`RECOMMENDATION.md`](./RECOMMENDATION.md), the
durable product record in [`PRODUCT.md`](./PRODUCT.md), and implementation
status in [`Progress.md`](./Progress.md).

## Stack

- **Next.js 16** App Router, Turbopack, `proxy.ts` (formerly middleware)
- **React 19** + **shadcn/ui** (Base UI)
- **Supabase** — Postgres, Row Level Security, Auth, Storage, Realtime
- **PostGIS** for outlets, visits, territories and GPS tracking

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

## Database

Migrations live in [`supabase/migrations/`](./supabase/migrations). They include
the full schema, tenant-aware RLS, storage buckets, reporting views and seed
data.

```bash
npm run db:start    # local Supabase stack (requires Docker)
npm run db:reset    # apply all migrations locally
npm run db:push     # push migrations to the linked hosted project
npm run db:types    # regenerate lib/supabase/database.types.ts
```

After pushing migrations to a linked project, regenerate the typed client with
`npm run db:types`. Until then, `lib/supabase/database.types.ts` contains a
hand-written subset covering the Phase 0 tables.

## Auth setup

- Add `http://localhost:3000/auth/callback` (and your deployed origin's
  equivalent) under **Authentication → URL Configuration → Redirect URLs**.
- Set the project **Site URL** to your app origin. Email confirmation links and
  password reset links return through `/auth/callback`.
- Supabase requires email confirmation by default. Signup then shows a
  "check your inbox" screen; configure SMTP or disable confirmation for local
  testing.
- A new account has no organization. `/onboarding` calls
  `bootstrap_organization` to create one and make the caller its Administrator.

See [`Progress.md`](./Progress.md) for the migration log, module tracker,
Supabase-specific decisions and remaining work.
