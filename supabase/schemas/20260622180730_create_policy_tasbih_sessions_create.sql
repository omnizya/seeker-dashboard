create policy tasbih_sessions_create on spiritual.tasbih_sessions for insert to authenticated with check ( user_id = (select auth.uid()) and (select rbac.authorize('tasbih.create')) );
