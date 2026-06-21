-- ================================================================
-- FOUNDATION: extensions, schemas, enums, internal helpers
-- Run first. Everything else depends on this.
-- ================================================================

create extension if not exists "uuid-ossp";

create schema if not exists core;
create schema if not exists identity;
create schema if not exists rbac;
create schema if not exists spiritual;
create schema if not exists audit;
create schema if not exists api;
create schema if not exists internal;
create schema if not exists magick;

-- ---- enums ----------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_status'
      and n.nspname = 'public'
  ) then
    create type public.user_status as enum ('ONLINE', 'OFFLINE');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'rbac'
  ) then
    create type rbac.app_role as enum ('master', 'teacher', 'student', 'user');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_permission'
      and n.nspname = 'rbac'
  ) then
    create type rbac.app_permission as enum(
      'holy_names.read',
      'holy_names.create',
      'holy_names.update',
      'holy_names.delete',
      'abjad.read',
      'abjad.create',
      'abjad.delete',
      'magick.read',
      'magick.create',
      'magick.delete',
      'users.manage',
      'audit.read'
    );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'element'
      and n.nspname = 'magick'
  ) then
    create type magick.element as enum ('aero', 'tera', 'igni', 'aqua');
  end if;
end$$;

-- ---- element config (memoised lookup) -------------------------
-- Pre-computed packed permutations. Replaces magick.element_packed()
-- with a single index lookup instead of a CASE per call.

create table if not exists magick.element_config (
  element magick.element primary key,
  packed bigint not null,
  forward_packed bigint not null
);

insert into magick.element_config (element, packed, forward_packed) values
  ('aero', 23102523171, 18129162870),
  ('tera', 6499345671,  34732340370),
  ('igni', 30652269921, 19632846870),
  ('aqua', 15051548421, 35233568370)
on conflict (element) do update set
  packed = excluded.packed,
  forward_packed = excluded.forward_packed;

-- ---- internal helpers -----------------------------------------

create or replace function internal.touch_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
