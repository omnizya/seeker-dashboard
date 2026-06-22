create policy holy_names_read on spiritual.holy_names for select to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('holy_names.read')) );
