/**
 * Offline migration smoke test. Applies every migration to an in-memory PGlite
 * database with minimal Supabase shims, then exercises onboarding and the
 * cross-cutting helpers. Run with: node scripts/verify-migrations.mjs
 */
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { PGlite } from "@electric-sql/pglite"

const db = new PGlite()

const shims = `
create schema if not exists extensions;
create schema if not exists auth;
create schema if not exists storage;

create or replace function gen_random_uuid() returns uuid
language sql volatile as $$
  select (md5(random()::text || clock_timestamp()::text))::uuid
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text,
  public boolean default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text,
  name text
);
create or replace function storage.foldername(text) returns text[]
language sql immutable as $$ select string_to_array($1, '/') $$;
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
end;
$$;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_app_meta_data jsonb not null default '{}'::jsonb,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  email_confirmed_at timestamptz
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon')
$$;

create or replace function extensions.st_makepoint(double precision, double precision)
returns text language sql immutable as $$ select 'POINT'::text $$;
create or replace function extensions.st_setsrid(text, integer)
returns text language sql immutable as $$ select $1 $$;
create or replace function extensions.st_distance(text, text)
returns double precision language sql immutable as $$ select 0::double precision $$;
`

await db.exec(shims)

const dir = join(process.cwd(), "supabase", "migrations")
const files = readdirSync(dir).filter((file) => file.endsWith(".sql")).sort()

for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf8")
    .replace(/create\s+extension[^;]+;/gi, "")
    .replace(/comment\s+on\s+extension[^;]+;/gi, "")
    .replace(/create\s+index[^;]*using\s+gist[^;]+;/gi, "")
    .replace(/extensions\.geography\([^)]*\)/gi, "text")
    .replace(/::extensions\.geography/g, "::text")
  try {
    await db.exec(sql)
  } catch (error) {
    console.error(`FAILED: ${file}`)
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
  console.log(`applied ${file}`)
}

const userId = "11111111-1111-1111-1111-111111111111"
await db.query(
  `insert into auth.users (id, email, email_confirmed_at)
   values ($1, 'owner@example.com', now()) on conflict do nothing`,
  [userId],
)
await db.query(`set request.jwt.claim.sub = '${userId}'`)
await db.query(`set request.jwt.claim.role = 'authenticated'`)

const bootstrap = await db.query(
  `select public.bootstrap_organization('Acme Distribution', 'ACME', 'UTC', 'USD') as id`,
)
const orgId = bootstrap.rows[0].id
console.log(`bootstrap organization: ${orgId}`)

await db.query(`select public.seed_standard_roles('${orgId}')`)

const checks = [
  ["permissions seeded", `select count(*)::int as n from public.permissions`, 180],
  ["roles seeded", `select count(*)::int as n from public.roles where org_id = '${orgId}'`, 6],
  ["effective permissions", `select count(*)::int as n from public.current_permissions()`, 180],
  ["tenant helper", `select public.parent_belongs_to_org('users','id','${userId}','${orgId}') as ok`, true],
  ["outlet distance", `select public.distance_to_outlet('00000000-0000-0000-0000-000000000000', 0, 0) as d`, null],
]

for (const [label, query, expected] of checks) {
  const { rows } = await db.query(query)
  const value = Object.values(rows[0])[0]
  const pass = expected === null ? value === null || value === 0 : value === expected
  console.log(`${pass ? "PASS" : "FAIL"} ${label}: ${value}`)
  if (!pass) process.exitCode = 1
}

// RLS isolation: a second tenant must be invisible to the first user.
const otherId = "22222222-2222-2222-2222-222222222222"
await db.query(
  `insert into auth.users (id, email, email_confirmed_at)
   values ($1, 'other@example.com', now()) on conflict do nothing`,
  [otherId],
)
await db.query(`set request.jwt.claim.sub = '${otherId}'`)
await db.query(`select public.bootstrap_organization('Other Co', 'OTHER', 'UTC', 'USD')`)

await db.query(`set request.jwt.claim.sub = '${userId}'`)
await db.query(`set role authenticated`)
const visible = await db.query(`select count(*)::int as n from public.organizations`)
await db.query(`reset role`)
const isolationPass = visible.rows[0].n === 1
console.log(`${isolationPass ? "PASS" : "FAIL"} tenant isolation: ${visible.rows[0].n} organizations visible`)
if (!isolationPass) process.exitCode = 1

await db.close()
