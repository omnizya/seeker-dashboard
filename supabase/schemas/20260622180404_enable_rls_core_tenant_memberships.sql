alter table core.tenant_memberships enable row level security;

drop policy if exists tenant_memberships_read on core.tenant_memberships;
drop policy if exists tenant_memberships_self_insert on core.tenant_memberships;
