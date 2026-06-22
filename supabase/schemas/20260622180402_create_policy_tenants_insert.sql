create policy tenants_insert on core.tenants for insert to authenticated
with check (true);
