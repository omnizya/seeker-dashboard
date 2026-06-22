create policy quran_bookmarks_read on spiritual.quran_bookmarks for select to authenticated using ( user_id = (select auth.uid()) and (select rbac.authorize('bookmarks.read')) );
