alter table rbac.user_roles enable row level security;

drop policy if exists user_roles_self_read on rbac.user_roles;
drop policy if exists user_roles_manage on rbac.user_roles;
