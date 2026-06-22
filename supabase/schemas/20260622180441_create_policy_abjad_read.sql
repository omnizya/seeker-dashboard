create policy abjad_read on spiritual.abjad_calculations for select to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('abjad.read')) );
