-- ================================================================
-- CORE: tenancy (tenants, memberships), tenant context, creation
-- Depends on: 00_foundation, 01_identity
-- ================================================================

create table if not exists core.tenants (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists core.tenant_memberships (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references core.tenants (id) on delete cascade,
  user_id uuid not null references identity.profiles (id) on delete cascade,
  role rbac.app_role not null,
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);

-- Supports core.current_tenant() which filters by user_id alone
create index if not exists idx_tenant_memberships_user_id
  on core.tenant_memberships (user_id);

-- Supports RLS: WHERE user_id = auth.uid() OR is_tenant_master(tenant_id)
-- The (tenant_id, user_id) composite covers the membership lookup in is_tenant_master
create index if not exists idx_tenant_memberships_tenant_user
  on core.tenant_memberships (tenant_id, user_id);

-- ---- functions ------------------------------------------------

create or replace function core.current_tenant () returns uuid language sql stable as $$
  select tenant_id
  from core.tenant_memberships
  where user_id = auth.uid()
  order by created_at desc
  limit 1;
$$;

create or replace function core.is_tenant_master (target_tenant_id uuid) returns boolean language sql stable security definer
set
  search_path = core,
  auth,
  public as $$
  select exists (
    select 1
    from core.tenant_memberships m
    where m.tenant_id = target_tenant_id
      and m.user_id = auth.uid()
      and m.role in ('master', 'grand_master')
  );
$$;

create or replace function core.create_tenant (p_name text, p_slug text) returns uuid language plpgsql security invoker
set
  search_path = core,
  public as $$
declare
  t_id uuid := gen_random_uuid();
begin
  insert into core.tenants(id, name, slug)
  values (t_id, p_name, p_slug);

  insert into core.tenant_memberships(tenant_id, user_id, role)
  values (t_id, auth.uid(), 'master');

  return t_id;
end;
$$;

-- ---- RLS ------------------------------------------------------

alter table core.tenants enable row level security;

drop policy if exists tenants_member_read on core.tenants;
drop policy if exists tenants_insert on core.tenants;
drop policy if exists tenants_master_update on core.tenants;

create policy tenants_member_read on core.tenants for select to authenticated using (
  exists (
    select 1
    from core.tenant_memberships m
    where m.tenant_id = tenants.id
      and m.user_id = (select auth.uid())
  )
);

create policy tenants_insert on core.tenants for insert to authenticated
with check (true);

create policy tenants_master_update on core.tenants
for update to authenticated
using ((select core.is_tenant_master(tenants.id)))
with check ((select core.is_tenant_master(tenants.id)));

alter table core.tenant_memberships enable row level security;

drop policy if exists tenant_memberships_read on core.tenant_memberships;
drop policy if exists tenant_memberships_self_insert on core.tenant_memberships;

create policy tenant_memberships_read on core.tenant_memberships for select to authenticated using (
  user_id = (select auth.uid())
  or (select core.is_tenant_master(tenant_memberships.tenant_id))
);

create policy tenant_memberships_self_insert on core.tenant_memberships for insert to authenticated
with check (user_id = (select auth.uid()));
