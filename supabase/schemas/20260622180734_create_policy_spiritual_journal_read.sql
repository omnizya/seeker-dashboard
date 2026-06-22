create policy spiritual_journal_read on spiritual.spiritual_journal for select to authenticated using ( user_id = (select auth.uid()) and (select rbac.authorize('journal.read')) );
