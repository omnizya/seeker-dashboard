create policy user_preferences_read on identity.user_preferences for select to authenticated using ( user_id = (select auth.uid()) );
