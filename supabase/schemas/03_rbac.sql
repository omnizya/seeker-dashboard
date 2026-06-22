-- ================================================================
-- RBAC: roles, permissions, authorization, default role assignment
-- Depends on: 00_foundation, 01_identity
-- ================================================================

create table if not exists rbac.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references identity.profiles (id) on delete cascade,
  role rbac.app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

create table if not exists rbac.role_permissions (
  id bigint generated always as identity primary key,
  role rbac.app_role not null,
  permission rbac.app_permission not null,
  unique (role, permission)
);

-- Supports rbac.authorize() RLS checks: WHERE user_id = X AND role = Y
-- Covers both user_roles scan and the join to role_permissions
create index if not exists idx_user_roles_user_role
  on rbac.user_roles (user_id, role);

-- ---- functions ------------------------------------------------

create or replace function rbac.authorize (requested_permission rbac.app_permission) returns boolean language sql stable security definer
set
  search_path = rbac,
  identity,
  auth,
  public as $$
  select exists (
    select 1
    from rbac.user_roles ur
    join rbac.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission = requested_permission
  );
$$;

create or replace function rbac.is_grand_master () returns boolean language sql stable security definer
set
  search_path = rbac,
  auth,
  public as $$
  select exists (
    select 1
    from rbac.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'grand_master'
  );
$$;

create or replace function rbac.assign_default_role () returns trigger language plpgsql security definer
set
  search_path = rbac,
  public as $$
begin
  insert into rbac.user_roles(user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

-- ---- triggers -------------------------------------------------

drop trigger if exists assign_default_role_trigger on identity.profiles;
create trigger assign_default_role_trigger
after insert on identity.profiles for each row
execute function rbac.assign_default_role ();

-- ---- RLS ------------------------------------------------------

alter table rbac.user_roles enable row level security;

drop policy if exists user_roles_self_read on rbac.user_roles;
drop policy if exists user_roles_manage on rbac.user_roles;

create policy user_roles_self_read on rbac.user_roles for select to authenticated using (
  user_id = (select auth.uid())
  or (select rbac.authorize('users.manage'))
);

create policy user_roles_manage on rbac.user_roles for all to authenticated
using ((select rbac.authorize('users.manage')))
with check ((select rbac.authorize('users.manage')));

alter table rbac.role_permissions enable row level security;

drop policy if exists role_permissions_read on rbac.role_permissions;
drop policy if exists role_permissions_manage on rbac.role_permissions;

create policy role_permissions_read on rbac.role_permissions for select to authenticated using (true);

create policy role_permissions_manage on rbac.role_permissions for all to authenticated
using ((select rbac.authorize('users.manage')))
with check ((select rbac.authorize('users.manage')));
