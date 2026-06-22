create table if not exists rbac.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references identity.profiles (id) on delete cascade,
  role rbac.app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);
