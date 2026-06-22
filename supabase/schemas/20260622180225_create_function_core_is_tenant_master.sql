
create or replace function core.is_tenant_master (target_tenant_id uuid) returns boolean language sql stable security definer
set
  search_path = core,
  auth,
  public as $$
  select exists (
    select 1
    from core.tenant_memberships m
    where m.tenant_id = target_tenant_id
      and m.user_id = auth.uid()
      and m.role in ('master', 'grand_master')
  );
$$;
