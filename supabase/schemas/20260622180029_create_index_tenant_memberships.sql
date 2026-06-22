-- Supports core.current_tenant() which filters by user_id alone
create index if not exists idx_tenant_memberships_user_id
  on core.tenant_memberships (user_id);
