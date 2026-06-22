create policy abjad_create on spiritual.abjad_calculations for insert to authenticated with check ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('abjad.create')) );
