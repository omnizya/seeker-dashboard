create policy square_calc_create on magick.square_calculations for insert to authenticated with check ( tenant_id = (select core.current_tenant()) and (select rbac.authorize ('magick.create')) );
