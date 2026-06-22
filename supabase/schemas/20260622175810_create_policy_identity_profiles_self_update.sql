
create policy profiles_self_update on identity.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));
