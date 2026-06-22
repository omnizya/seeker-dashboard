create policy audit_events_read on audit.events for select to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('audit.read')) );
