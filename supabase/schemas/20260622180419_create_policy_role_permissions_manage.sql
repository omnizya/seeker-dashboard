create policy role_permissions_manage on rbac.role_permissions for all to authenticated
using ((select rbac.authorize('users.manage')))
with check ((select rbac.authorize('users.manage')));
