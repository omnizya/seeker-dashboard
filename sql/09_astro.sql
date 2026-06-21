-- ================================================================
-- ASTRO: sun/moon phases, ephemeris events, qibla calculation
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- ================================================================

-- ---- extended permissions --------------------------------------

do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = (
    select oid from pg_type where typname = 'app_permission' and nspname = 'rbac'
  ) and enumlabel = 'astro.read') then
    alter type rbac.app_permission add value 'astro.read';
    alter type rbac.app_permission add value 'astro.create';
    alter type rbac.app_permission add value 'qibla.read';
    alter type rbac.app_permission add value 'qibla.create';
  end if;
end$$;

-- ---- moon phase enum ------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'moon_phase'
      and n.nspname = 'spiritual'
  ) then
    create type spiritual.moon_phase as enum (
      'new_moon',
      'waxing_crescent',
      'first_quarter',
      'waxing_gibbous',
      'full_moon',
      'waning_gibbous',
      'third_quarter',
      'waning_crescent'
    );
  end if;
end$$;

-- ---- astro events (sun/moon phases, equinoxes, solstices) -----

create table if not exists spiritual.astro_events (
  id bigint generated always as identity primary key,
  event_date timestamptz not null,

  -- Sun
  sunrise timestamptz,
  sunset timestamptz,
  solar_noon timestamptz,
  day_length_seconds integer,
  is_equinox boolean default false,
  is_solstice boolean default false,
  season text check (season in ('spring', 'summer', 'autumn', 'winter')),

  -- Moon
  moon_rise timestamptz,
  moon_set timestamptz,
  moon_phase spiritual.moon_phase,
  moon_illumination numeric(5,2),    -- 0-100% illuminated
  moon_age_days numeric(6,2),        -- days since new moon
  moon_distance_km numeric(10,2),
  moon_sign text,                     -- zodiac sign the moon is in

  -- Lunar month tracking
  lunar_month_day smallint,           -- day of current lunar month (1-29/30)
  next_new_moon timestamptz,
  next_full_moon timestamptz,

  source text default 'api',
  calculated_by uuid references identity.profiles (id),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  unique (event_date)
);

create index if not exists idx_astro_events_date
  on spiritual.astro_events (event_date desc);
create index if not exists idx_astro_events_moon_phase
  on spiritual.astro_events (moon_phase);
create index if not exists idx_astro_events_tenant
  on spiritual.astro_events (tenant_id);

-- ---- qibla direction ------------------------------------------

create table if not exists spiritual.qibla_calculations (
  id bigint generated always as identity primary key,
  from_lat numeric(9,6) not null,
  from_lng numeric(9,6) not null,

  -- Kaaba coordinates (fixed)
  kaaba_lat numeric(9,6) not null default 21.4225,
  kaaba_lng numeric(9,6) not null default 39.8262,

  bearing numeric(8,4) not null,         -- degrees from north (0-360)
  distance_km numeric(10,2) not null,    -- great-circle distance

  calculated_by uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  unique (from_lat, from_lng)
);

create index if not exists idx_qibla_calc_tenant
  on spiritual.qibla_calculations (tenant_id);

-- ---- compute qibla bearing (spherical trigonometry) ------------

create or replace function spiritual.compute_qibla (
  p_lat numeric,
  p_lng numeric,
  out bearing numeric,
  out distance_km numeric
) language sql immutable as $$
  with kaaba as (
    select
      21.4225 as k_lat,
      39.8262 as k_lng
  ),
  trig as (
    select
      radians(p_lat) as phi1,
      radians(k_lat) as phi2,
      radians(k_lng - p_lng) as delta_lambda
    from kaaba
  ),
  bearing_rad as (
    select
      atan2(
        sin(delta_lambda),
        cos(phi1) * tan(phi2) - sin(phi1) * cos(delta_lambda)
      ) as theta
    from trig
  ),
  distance_rad as (
    select
      acos(
        sin(phi1) * sin(phi2) + cos(phi1) * cos(phi2) * cos(delta_lambda)
      ) as delta_sigma
    from trig
  )
  select
    degrees(theta) as bearing,
    (6371.0 * delta_sigma)::numeric(10,2) as distance_km
  from bearing_rad, distance_rad;
$$;

-- ---- triggers --------------------------------------------------

drop trigger if exists set_astro_events_tenant on spiritual.astro_events;
create trigger set_astro_events_tenant before insert on spiritual.astro_events for each row
execute function spiritual.inject_tenant ();

drop trigger if exists astro_events_audit on spiritual.astro_events;
create trigger astro_events_audit
after insert or delete on spiritual.astro_events for each row
execute function audit.log_change ();

drop trigger if exists set_qibla_calc_tenant on spiritual.qibla_calculations;
create trigger set_qibla_calc_tenant before insert on spiritual.qibla_calculations for each row
execute function spiritual.inject_tenant ();

-- ---- RLS ------------------------------------------------------

alter table spiritual.astro_events enable row level security;
alter table spiritual.qibla_calculations enable row level security;

-- astro events
drop policy if exists astro_events_read on spiritual.astro_events;
drop policy if exists astro_events_create on spiritual.astro_events;

create policy astro_events_read on spiritual.astro_events for select to authenticated using (
  (tenant_id = (select core.current_tenant()) or tenant_id is null)
  and (select rbac.authorize('astro.read'))
);

create policy astro_events_create on spiritual.astro_events for insert to authenticated
with check (
  (select rbac.authorize('astro.create'))
);

-- qibla
drop policy if exists qibla_read on spiritual.qibla_calculations;
drop policy if exists qibla_create on spiritual.qibla_calculations;

create policy qibla_read on spiritual.qibla_calculations for select to authenticated using (
  (tenant_id = (select core.current_tenant()) or tenant_id is null)
  and (select rbac.authorize('qibla.read'))
);

create policy qibla_create on spiritual.qibla_calculations for insert to authenticated
with check (
  calculated_by = (select auth.uid())
  and (select rbac.authorize('qibla.create'))
);

-- ---- API views -------------------------------------------------

drop view if exists api.astro_events;
create view api.astro_events
with (security_invoker = true) as
select
  ae.id,
  ae.event_date,
  ae.sunrise,
  ae.sunset,
  ae.day_length_seconds,
  ae.moon_rise,
  ae.moon_set,
  ae.moon_phase,
  ae.moon_illumination,
  ae.moon_age_days,
  ae.moon_sign,
  ae.lunar_month_day,
  ae.next_new_moon,
  ae.next_full_moon,
  ae.is_equinox,
  ae.is_solstice,
  ae.season,
  ae.tenant_id,
  p.display_name as calculated_by
from
  spiritual.astro_events ae
  join identity.profiles p on p.id = ae.calculated_by;

drop view if exists api.qibla;
create view api.qibla
with (security_invoker = true) as
select
  qc.id,
  qc.from_lat,
  qc.from_lng,
  qc.bearing,
  qc.distance_km,
  qc.tenant_id,
  p.display_name as calculated_by
from
  spiritual.qibla_calculations qc
  join identity.profiles p on p.id = qc.calculated_by;
