
create table if not exists core.tenant_memberships (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references core.tenants (id) on delete cascade,
  user_id uuid not null references identity.profiles (id) on delete cascade,
  role rbac.app_role not null,
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);
