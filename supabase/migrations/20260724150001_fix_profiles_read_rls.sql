-- CRITICAL FIX: profiles_read self-join re-triggers RLS on tenant_memberships
-- Previous: Self-join on tenant_memberships (m1, m2) re-triggers that table's own RLS
-- Result: non-master members can't see teammates' profiles
-- Fix: Create security_definer helper, same pattern as core.is_tenant_master

-- Helper function: check if user shares a tenant with target user
create or replace function identity.shares_tenant_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = identity, core, auth, public as $$
  select exists (
    select 1
    from core.tenant_memberships m1
    join core.tenant_memberships m2 on m1.tenant_id = m2.tenant_id
    where m1.user_id = auth.uid()
      and m2.user_id = target_user_id
  );
$$;

-- Replace the broken policy
drop policy if exists profiles_read on identity.profiles;

create policy profiles_read on identity.profiles for select to authenticated using (
  id = (select auth.uid())
  or identity.shares_tenant_with(id)
);
