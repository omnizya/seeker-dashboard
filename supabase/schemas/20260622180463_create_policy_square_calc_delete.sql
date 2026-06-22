create policy square_calc_delete on magick.square_calculations for delete to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('magick.delete')) );
