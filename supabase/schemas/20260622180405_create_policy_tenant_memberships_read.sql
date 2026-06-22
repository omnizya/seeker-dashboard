create policy tenant_memberships_read on core.tenant_memberships for select to authenticated using (
  user_id = (select auth.uid())
  or (select core.is_tenant_master(tenant_memberships.tenant_id))
);
