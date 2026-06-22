alter table rbac.role_permissions enable row level security;

drop policy if exists role_permissions_read on rbac.role_permissions;
drop policy if exists role_permissions_manage on rbac.role_permissions;
