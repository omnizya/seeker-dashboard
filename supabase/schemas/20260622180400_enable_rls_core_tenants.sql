
alter table core.tenants enable row level security;

drop policy if exists tenants_member_read on core.tenants;
drop policy if exists tenants_insert on core.tenants;
drop policy if exists tenants_master_update on core.tenants;
