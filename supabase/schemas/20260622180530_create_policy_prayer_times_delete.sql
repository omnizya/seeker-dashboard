create policy prayer_times_delete on spiritual.prayer_times for delete to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize('prayer.delete')) );
