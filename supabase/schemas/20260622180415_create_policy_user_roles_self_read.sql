create policy user_roles_self_read on rbac.user_roles for select to authenticated using (
  user_id = (select auth.uid())
  or (select rbac.authorize('users.manage'))
);
