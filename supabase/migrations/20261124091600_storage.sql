-- ============================================================================
-- Supabase Storage buckets and tenant-scoped object policies.
-- Convention: every object path starts with the organization id, e.g.
--   <org_id>/<entity>/<file>
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('employee-documents', 'employee-documents', false),
  ('outlet-photos', 'outlet-photos', false),
  ('visit-photos', 'visit-photos', false),
  ('expense-receipts', 'expense-receipts', false),
  ('attachments', 'attachments', false),
  ('imports-exports', 'imports-exports', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

-- Public avatar reads (writes are still restricted below).
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select
  using (bucket_id = 'avatars');

do $$
declare
  b text;
begin
  foreach b in array array[
    'avatars', 'employee-documents', 'outlet-photos', 'visit-photos',
    'expense-receipts', 'attachments', 'imports-exports', 'reports'
  ] loop
    execute format('drop policy if exists %I on storage.objects', 'org_read_' || b);
    execute format(
      'create policy %I on storage.objects for select to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = public.current_org_id()::text)',
      'org_read_' || b, b
    );

    execute format('drop policy if exists %I on storage.objects', 'org_insert_' || b);
    execute format(
      'create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and (storage.foldername(name))[1] = public.current_org_id()::text)',
      'org_insert_' || b, b
    );

    execute format('drop policy if exists %I on storage.objects', 'org_update_' || b);
    execute format(
      'create policy %I on storage.objects for update to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = public.current_org_id()::text) with check (bucket_id = %L and (storage.foldername(name))[1] = public.current_org_id()::text)',
      'org_update_' || b, b, b
    );

    execute format('drop policy if exists %I on storage.objects', 'org_delete_' || b);
    execute format(
      'create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and (storage.foldername(name))[1] = public.current_org_id()::text)',
      'org_delete_' || b, b
    );
  end loop;
end;
$$;
