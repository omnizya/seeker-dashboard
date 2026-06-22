
create or replace function core.current_tenant () returns uuid language sql stable as $$
  select tenant_id
  from core.tenant_memberships
  where user_id = auth.uid()
  order by created_at desc
  limit 1;
$$;
