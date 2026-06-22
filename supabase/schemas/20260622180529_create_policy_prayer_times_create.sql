create policy prayer_times_create on spiritual.prayer_times for insert to authenticated with check ( tenant_id = (select core.current_tenant()) and (select rbac.authorize('prayer.create')) );
