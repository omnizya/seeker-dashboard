create policy planetary_hours_delete on spiritual.planetary_hours for delete to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize('planetary.delete')) );
