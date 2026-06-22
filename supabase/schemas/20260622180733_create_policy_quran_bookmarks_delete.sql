create policy quran_bookmarks_delete on spiritual.quran_bookmarks for delete to authenticated using ( user_id = (select auth.uid()) and (select rbac.authorize('bookmarks.delete')) );
