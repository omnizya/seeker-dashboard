
create policy profiles_read on identity.profiles for select to authenticated using (
  id = (select auth.uid())
  or exists (
    select 1
    from core.tenant_memberships m1
    join core.tenant_memberships m2 on m1.tenant_id = m2.tenant_id
    where m1.user_id = (select auth.uid())
      and m2.user_id = profiles.id
  )
);
