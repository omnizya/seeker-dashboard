create or replace function rbac.authorize (requested_permission rbac.app_permission) returns boolean language sql stable security definer
set
  search_path = rbac,
  identity,
  auth,
  public as $$
  select exists (
    select 1
    from rbac.user_roles ur
    join rbac.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission = requested_permission
  );
$$;
