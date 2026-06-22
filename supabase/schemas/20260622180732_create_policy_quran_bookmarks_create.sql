create policy quran_bookmarks_create on spiritual.quran_bookmarks for insert to authenticated with check ( user_id = (select auth.uid()) and (select rbac.authorize('bookmarks.create')) );
