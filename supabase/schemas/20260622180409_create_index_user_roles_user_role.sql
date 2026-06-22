-- Supports rbac.authorize() RLS checks: WHERE user_id = X AND role = Y
-- Covers both user_roles scan and the join to role_permissions
create index if not exists idx_user_roles_user_role
  on rbac.user_roles (user_id, role);
