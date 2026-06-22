create policy tenant_memberships_self_insert on core.tenant_memberships for insert to authenticated
with check (user_id = (select auth.uid()));
