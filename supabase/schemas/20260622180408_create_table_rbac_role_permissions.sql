create table if not exists rbac.role_permissions (
  id bigint generated always as identity primary key,
  role rbac.app_role not null,
  permission rbac.app_permission not null,
  unique (role, permission)
);
