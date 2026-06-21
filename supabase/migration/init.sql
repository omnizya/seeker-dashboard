-- =========================================================
-- 1. CORE ENUMS
-- =========================================================
create type public.user_status as enum('ONLINE', 'OFFLINE');

-- =========================================================
-- 2. SCHEMAS
-- =========================================================
create schema if not exists identity;

create schema if not exists rbac;

create schema if not exists spiritual;

create schema if not exists audit;

create schema if not exists api;

create schema if not exists internal;

-- =========================================================
-- 3. IDENTITY LAYER (Supabase Auth Bridge)
-- =========================================================
create table identity.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  status public.user_status default 'OFFLINE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- 4. RBAC ENUMS
-- =========================================================
create type rbac.app_role as enum('master', 'teacher', 'student', 'user');

create type rbac.app_permission as enum(
  'holy_names.read',
  'holy_names.create',
  'holy_names.update',
  'holy_names.delete',
  'abjad.read',
  'abjad.create',
  'abjad.delete',
  'users.manage',
  'audit.read'
);

-- =========================================================
-- 5. RBAC TABLES
-- =========================================================
create table rbac.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references identity.profiles (id) on delete cascade,
  role rbac.app_role not null,
  assigned_at timestamptz default now(),
  unique (user_id, role)
);

create table rbac.role_permissions (
  id bigint generated always as identity primary key,
  role rbac.app_role not null,
  permission rbac.app_permission not null,
  unique (role, permission)
);

-- =========================================================
-- 6. AUTHORIZATION FUNCTION (SECURE)
-- =========================================================
create or replace function rbac.authorize (requested_permission rbac.app_permission) returns boolean language sql security definer
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

-- =========================================================
-- 7. SPIRITUAL DOMAIN
-- =========================================================
create table spiritual.holy_names (
  id bigint generated always as identity primary key,
  holy_name text not null unique,
  base_value integer,
  submitted_by uuid not null references identity.profiles (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table spiritual.abjad_calculations (
  id bigint generated always as identity primary key,
  holy_name_id bigint not null references spiritual.holy_names (id) on delete cascade,
  calculated_value integer not null,
  calculated_by uuid not null references identity.profiles (id),
  notes text,
  created_at timestamptz default now()
);

-- =========================================================
-- 8. AUDIT LOGGING
-- =========================================================
create table audit.events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  table_name text,
  operation text,
  record_id text,
  payload jsonb,
  created_at timestamptz default now()
);

create or replace function audit.log_change () returns trigger language plpgsql security definer
set
  search_path = audit,
  public as $$
begin
  insert into audit.events (
    actor_id,
    table_name,
    operation,
    record_id,
    payload
  )
  values (
    auth.uid(),
    tg_table_name,
    tg_op,
    coalesce(new.id, old.id)::text,
    case
      when tg_op = 'DELETE' then to_jsonb(old)
      else to_jsonb(new)
    end
  );

  return coalesce(new, old);
end;
$$;

-- =========================================================
-- 9. INTERNAL HELPERS
-- =========================================================
create function internal.touch_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =========================================================
-- 10. PROFILE AUTO-CREATION (SUPABASE SAFE)
-- =========================================================
create or replace function identity.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = identity,
  public as $$
begin
  insert into identity.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function identity.handle_new_user ();

-- =========================================================
-- 11. DEFAULT ROLE ASSIGNMENT
-- =========================================================
create or replace function rbac.assign_default_role () returns trigger language plpgsql as $$
begin
  insert into rbac.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger assign_default_role_trigger
after insert on identity.profiles for each row
execute function rbac.assign_default_role ();

-- =========================================================
-- 12. AUDIT TRIGGER (SPIRITUAL TABLES)
-- =========================================================
create trigger holy_names_audit
after insert
or
update
or delete on spiritual.holy_names for each row
execute function audit.log_change ();

-- =========================================================
-- 13. UPDATED_AT TRIGGERS
-- =========================================================
create trigger holy_names_updated before
update on spiritual.holy_names for each row
execute function internal.touch_updated_at ();

-- =========================================================
-- 14. API LAYER (FRONTEND SAFE VIEW)
-- =========================================================
create view api.holy_names as
select
  hn.id,
  hn.holy_name,
  hn.base_value,
  p.display_name as submitted_by
from
  spiritual.holy_names hn
  join identity.profiles p on p.id = hn.submitted_by;

-- =========================================================
-- 15. RLS
-- =========================================================
alter table spiritual.holy_names enable row level security;

create policy holy_names_read on spiritual.holy_names for
select
  to authenticated using (rbac.authorize ('holy_names.read'));

create policy holy_names_create on spiritual.holy_names for insert to authenticated
with
  check (rbac.authorize ('holy_names.create'));
