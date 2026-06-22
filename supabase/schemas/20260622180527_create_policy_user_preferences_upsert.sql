create policy user_preferences_upsert on identity.user_preferences for insert to authenticated with check ( user_id = (select auth.uid()) and (select rbac.authorize('preferences.update')) );
