-- MEDIUM FIX: tenants_insert policy with check (true) bypasses core.create_tenant()
-- Any authenticated user can insert directly into core.tenants
-- No auto-membership created, opens slug-squatting and orphan tenants
-- Fix: Remove the permissive policy; tenants should only be created via core.create_tenant()

drop policy if exists tenants_insert on core.tenants;
