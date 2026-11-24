-- ============================================================================
-- Field-service helpers and offline support.
-- ============================================================================

-- Distance in metres from a coordinate to an outlet, using PostGIS geography.
create or replace function public.distance_to_outlet(
  p_outlet uuid,
  p_lat double precision,
  p_lng double precision
)
returns double precision
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select st_distance(
    st_setsrid(st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
    o.location
  )
  from public.outlets o
  where o.id = p_outlet
    and o.org_id = public.current_org_id();
$$;

comment on function public.distance_to_outlet(uuid, double precision, double precision) is
  'Metres from a latitude/longitude to an outlet in the caller''s organization.';

grant execute on function public.distance_to_outlet(uuid, double precision, double precision) to authenticated;

create or replace function public.mark_notifications_read(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.notifications
     set read_at = now()
   where user_id = auth.uid()
     and org_id = public.current_org_id()
     and id = any(p_ids);
end;
$$;

grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

-- Client-generated UUIDs let field submissions be created offline and retried
-- safely without duplicating rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'visits', 'form_submissions', 'expenses', 'orders',
    'sales_transactions', 'service_tickets', 'attendances'
  ] loop
    if to_regclass(format('public.%I', t)) is not null then
      if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = t and column_name = 'client_uuid'
      ) then
        execute format('alter table public.%I add column client_uuid uuid', t);
      end if;
      if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = t and column_name = 'synced_at'
      ) then
        execute format('alter table public.%I add column synced_at timestamptz', t);
      end if;
      if not exists (
        select 1 from pg_indexes
        where schemaname = 'public' and tablename = t and indexname = format('%I_client_uuid_key', t)
      ) then
        execute format(
          'create unique index %I on public.%I (org_id, client_uuid) where client_uuid is not null',
          format('%I_client_uuid_key', t),
          t
        );
      end if;
    end if;
  end loop;
end;
$$;
