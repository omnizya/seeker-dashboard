create policy abjad_delete on spiritual.abjad_calculations for delete to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('abjad.delete')) );
