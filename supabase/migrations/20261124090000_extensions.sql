-- ============================================================================
-- Beekeeper ERP — extensions
-- Supabase installs extensions in the dedicated `extensions` schema.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;

comment on extension postgis is 'Geospatial types used by outlets, visits, tracking and territories';
