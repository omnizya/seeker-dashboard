create policy planet_positions_create on spiritual.planet_positions for insert to authenticated with check ( tenant_id = (select core.current_tenant()) and (select rbac.authorize('astro.create')) );
