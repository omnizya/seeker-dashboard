create policy tenants_master_update on core.tenants
for update to authenticated
using ((select core.is_tenant_master(tenants.id)))
with check ((select core.is_tenant_master(tenants.id)));
