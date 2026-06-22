create policy dua_lists_create on spiritual.dua_lists for insert to authenticated with check (user_id = (select auth.uid()));
