create policy spiritual_journal_delete on spiritual.spiritual_journal for delete to authenticated using ( user_id = (select auth.uid()) and (select rbac.authorize('journal.delete')) );
