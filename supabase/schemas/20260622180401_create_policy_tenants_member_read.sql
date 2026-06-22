create policy tenants_member_read on core.tenants for select to authenticated using (
  exists (
    select 1
    from core.tenant_memberships m
    where m.tenant_id = tenants.id
      and m.user_id = (select auth.uid())
  )
);
