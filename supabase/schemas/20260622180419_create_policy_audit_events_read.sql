-- Basic audit read policy: tenant-scoped, no RBAC check.
-- Full RBAC-gated version is in 202606221804190_rbac_policy.sql (after rbac.authorize exists).
create policy audit_events_read on audit.events for select to authenticated using (
  tenant_id = (select core.current_tenant())
);
