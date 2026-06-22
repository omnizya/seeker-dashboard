-- ================================================================
-- SPIRITUAL: holy names, abjad calculations
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- Also uses: internal.touch_updated_at, audit.log_change
-- ================================================================

create table if not exists spiritual.holy_names (
  id bigint generated always as identity primary key,
  holy_name text not null unique,
  base_value integer,
  submitted_by uuid not null references identity.profiles (id),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists spiritual.abjad_calculations (
  id bigint generated always as identity primary key,
  holy_name_id bigint not null references spiritual.holy_names (id) on delete cascade,
  calculated_value integer not null,
  calculated_by uuid not null references identity.profiles (id),
  tenant_id uuid references core.tenants (id),
  notes text,
  created_at timestamptz default now()
);

-- FK indexes for joins and RLS tenant_id checks
create index if not exists idx_holy_names_submitted_by
  on spiritual.holy_names (submitted_by);
create index if not exists idx_holy_names_tenant_id
  on spiritual.holy_names (tenant_id);
create index if not exists idx_abjad_calc_holy_name_id
  on spiritual.abjad_calculations (holy_name_id);
create index if not exists idx_abjad_calc_tenant_id
  on spiritual.abjad_calculations (tenant_id);
create index if not exists idx_abjad_calc_calculated_by
  on spiritual.abjad_calculations (calculated_by);

-- Composite index for API view join + RLS tenant filter
create index if not exists idx_holy_names_tenant_submitted
  on spiritual.holy_names (tenant_id, submitted_by);

-- ---- functions ------------------------------------------------

create or replace function spiritual.inject_tenant () returns trigger language plpgsql as $$
begin
  if new.tenant_id is null then
    new.tenant_id := core.current_tenant();
  end if;

  if new.tenant_id is null then
    raise exception 'Tenant context missing';
  end if;

  return new;
end;
$$;

-- ---- triggers -------------------------------------------------

drop trigger if exists set_holy_names_tenant on spiritual.holy_names;
create trigger set_holy_names_tenant before insert on spiritual.holy_names for each row
execute function spiritual.inject_tenant ();

drop trigger if exists holy_names_updated on spiritual.holy_names;
create trigger holy_names_updated before
update on spiritual.holy_names for each row
execute function internal.touch_updated_at ();

drop trigger if exists holy_names_audit on spiritual.holy_names;
create trigger holy_names_audit
after insert or update or delete on spiritual.holy_names for each row
execute function audit.log_change ();

drop trigger if exists set_abjad_calc_tenant on spiritual.abjad_calculations;
create trigger set_abjad_calc_tenant before insert on spiritual.abjad_calculations for each row
execute function spiritual.inject_tenant ();

drop trigger if exists abjad_calc_audit on spiritual.abjad_calculations;
create trigger abjad_calc_audit
after insert or delete on spiritual.abjad_calculations for each row
execute function audit.log_change ();

-- ---- API view -------------------------------------------------

drop view if exists api.holy_names;
create view api.holy_names
with (security_invoker = true) as
select
  hn.id,
  hn.holy_name,
  hn.base_value,
  hn.tenant_id,
  p.display_name as submitted_by
from
  spiritual.holy_names hn
  join identity.profiles p on p.id = hn.submitted_by;

-- ---- RLS ------------------------------------------------------

alter table spiritual.holy_names enable row level security;

drop policy if exists holy_names_read on spiritual.holy_names;
drop policy if exists holy_names_create on spiritual.holy_names;
drop policy if exists holy_names_update on spiritual.holy_names;
drop policy if exists holy_names_delete on spiritual.holy_names;

create policy holy_names_read on spiritual.holy_names for select to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('holy_names.read'))
);

create policy holy_names_create on spiritual.holy_names for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('holy_names.create'))
);

create policy holy_names_update on spiritual.holy_names for update to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('holy_names.update'))
)
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('holy_names.update'))
);

create policy holy_names_delete on spiritual.holy_names for delete to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('holy_names.delete'))
);

alter table spiritual.abjad_calculations enable row level security;

drop policy if exists abjad_read on spiritual.abjad_calculations;
drop policy if exists abjad_create on spiritual.abjad_calculations;
drop policy if exists abjad_delete on spiritual.abjad_calculations;

create policy abjad_read on spiritual.abjad_calculations for select to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('abjad.read'))
);

create policy abjad_create on spiritual.abjad_calculations for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('abjad.create'))
);

create policy abjad_delete on spiritual.abjad_calculations for delete to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('abjad.delete'))
);
