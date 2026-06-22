create policy dua_lists_read on spiritual.dua_lists for select to authenticated using ( is_public = true or user_id = (select auth.uid()) );
