-- ================================================================
-- IDENTITY: user profiles, auth hooks, RLS
-- Depends on: 00_foundation
-- ================================================================

create table if not exists identity.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  status public.user_status default 'OFFLINE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Covering index for API views that join profiles on id -> display_name
-- Avoids heap fetch for the most common view query pattern
create index if not exists idx_profiles_id_display_name
  on identity.profiles (id) include (display_name);

-- ---- functions ------------------------------------------------

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

-- ---- triggers -------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row
execute function identity.handle_new_user ();

-- ---- RLS ------------------------------------------------------

alter table identity.profiles enable row level security;

drop policy if exists profiles_read on identity.profiles;
drop policy if exists profiles_self_update on identity.profiles;

create policy profiles_read on identity.profiles for select to authenticated using (
  id = (select auth.uid())
  or exists (
    select 1
    from core.tenant_memberships m1
    join core.tenant_memberships m2 on m1.tenant_id = m2.tenant_id
    where m1.user_id = (select auth.uid())
      and m2.user_id = profiles.id
  )
);

create policy profiles_self_update on identity.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));
