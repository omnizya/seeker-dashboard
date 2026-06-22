create policy square_calc_read on magick.square_calculations for select to authenticated using ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('magick.read')) );
