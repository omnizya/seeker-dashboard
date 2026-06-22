create policy spiritual_journal_create on spiritual.spiritual_journal for insert to authenticated with check ( user_id = (select auth.uid()) and (select rbac.authorize('journal.create')) );
