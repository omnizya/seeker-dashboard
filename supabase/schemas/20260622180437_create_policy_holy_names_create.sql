create policy holy_names_create on spiritual.holy_names for insert to authenticated with check ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('holy_names.create')) );
