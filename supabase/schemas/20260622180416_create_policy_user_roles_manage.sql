create policy user_roles_manage on rbac.user_roles for all to authenticated
using ((select rbac.authorize('users.manage')))
with check ((select rbac.authorize('users.manage')));
