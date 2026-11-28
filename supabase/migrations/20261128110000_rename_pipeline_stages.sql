-- Opportunity stages are the canonical stage master for the sales pipeline.
alter table public.pipeline_stages rename to opportunity_stages;

-- Refresh the onboarding function so it seeds the renamed table. Rebuilding it
-- from its current definition keeps every other default in sync.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.bootstrap_organization(text, text, text, text)'::regprocedure
  ) into v_definition;

  if v_definition is null then
    raise exception 'public.bootstrap_organization was not found';
  end if;

  v_definition := replace(
    v_definition,
    'public.pipeline_stages',
    'public.opportunity_stages'
  );
  execute v_definition;
end $$;
