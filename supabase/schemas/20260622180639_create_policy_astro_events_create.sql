create policy astro_events_create on spiritual.astro_events for insert to authenticated with check ( (select rbac.authorize('astro.create')) );
