-- ============================================================================
-- Corrective migration: onboarding writes an organization before the caller's
-- profile has an org_id. The original log_audit() tried to stamp that audit
-- row with current_org_id(), which is NULL at that point, so bootstrap failed
-- on audit_logs.org_id NOT NULL.
--
-- Replacing the function is enough: the audit triggers call it by name.
-- ============================================================================

create or replace function public.log_audit(
  p_module text,
  p_entity text,
  p_entity_id uuid,
  p_action text,
  p_changes jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid := public.current_org_id();
begin
  -- No tenant yet (signup/onboarding) means there is nothing to scope.
  if auth.uid() is null or v_org is null then
    return;
  end if;

  insert into public.audit_logs (org_id, user_id, module, entity_type, entity_id, action, changes)
  values (
    v_org,
    auth.uid(),
    p_module,
    p_entity,
    p_entity_id,
    p_action,
    coalesce(p_changes, '{}'::jsonb)
  );
end;
$$;

comment on function public.log_audit(text, text, uuid, text, jsonb) is
  'Writes an audit row for the signed-in user and their current organization; skips when unonboarded.';

grant execute on function public.log_audit(text, text, uuid, text, jsonb) to authenticated;
