-- Supports RLS: WHERE user_id = auth.uid() OR is_tenant_master(tenant_id)
-- The (tenant_id, user_id) composite covers the membership lookup in is_tenant_master
create index if not exists idx_tenant_memberships_tenant_user
  on core.tenant_memberships (tenant_id, user_id);
