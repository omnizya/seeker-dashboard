create policy qibla_create on spiritual.qibla_calculations for insert to authenticated with check ( calculated_by = (select auth.uid()) and (select rbac.authorize('qibla.create')) );
