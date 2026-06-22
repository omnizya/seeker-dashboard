create policy holy_names_delete on spiritual.holy_names for delete to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('holy_names.delete')) );
