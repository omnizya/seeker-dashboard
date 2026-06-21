-- ================================================================
-- PLANETARY: planetary hours computation, planet positions
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- ================================================================

-- ---- extended permissions --------------------------------------

do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = (
    select oid from pg_type where typname = 'app_permission' and nspname = 'rbac'
  ) and enumlabel = 'planetary.read') then
    alter type rbac.app_permission add value 'planetary.read';
    alter type rbac.app_permission add value 'planetary.create';
    alter type rbac.app_permission add value 'planetary.delete';
    alter type rbac.app_permission add value 'astro.read';
    alter type rbac.app_permission add value 'astro.create';
  end if;
end$$;

-- ---- Chaldean order (reference) --------------------------------
-- The 7 classical planets in Chaldean order, indexed 0-6.

create table if not exists spiritual.chaldean_order (
  idx smallint primary key check (idx between 0 and 6),
  planet text not null unique
);

insert into spiritual.chaldean_order (idx, planet) values
  (0, 'Saturn'),
  (1, 'Jupiter'),
  (2, 'Mars'),
  (3, 'Sun'),
  (4, 'Venus'),
  (5, 'Mercury'),
  (6, 'Moon')
on conflict (idx) do nothing;

-- Day-of-week → first hour ruler (0=Sun … 6=Sat, matching JS Date.getDay())
create table if not exists spiritual.day_rulers (
  day_of_week smallint primary key check (day_of_week between 0 and 6),
  planet text not null
);

insert into spiritual.day_rulers (day_of_week, planet) values
  (0, 'Sun'),
  (1, 'Moon'),
  (2, 'Mars'),
  (3, 'Mercury'),
  (4, 'Jupiter'),
  (5, 'Venus'),
  (6, 'Saturn')
on conflict (day_of_week) do nothing;

-- ---- planetary hours computation -------------------------------

-- Compute all 24 planetary hours for a given day.
-- Returns a set of rows with planet, start_utc, end_utc, is_daytime, hour_index.
-- Mirrors the JS computePlanetaryHours() in src/utils/planetary-hours.ts

create or replace function spiritual.compute_planetary_hours (
  p_date date,
  p_sunrise timestamptz,
  p_sunset timestamptz,
  p_next_sunrise timestamptz
) returns table (
  hour_index smallint,
  planet text,
  start_utc timestamptz,
  end_utc timestamptz,
  is_daytime boolean
)
language plpgsql stable as $$
declare
  day_ms numeric;
  night_ms numeric;
  day_hour_ms numeric;
  night_hour_ms numeric;
  day_ruler text;
  start_idx smallint;
  planet_idx smallint;
begin
  day_ms := extract(epoch from p_sunset - p_sunrise) * 1000;
  night_ms := extract(epoch from p_next_sunrise - p_sunset) * 1000;

  day_hour_ms := day_ms / 12.0;
  night_hour_ms := night_ms / 12.0;

  -- Determine day ruler from day of week
  select dr.planet into day_ruler
  from spiritual.day_rulers dr
  where dr.day_of_week = extract(dow from p_date)::smallint;

  select co.idx into start_idx
  from spiritual.chaldean_order co
  where co.planet = day_ruler;

  for i in 0..23 loop
    planet_idx := (start_idx + i) % 7;

    select co.planet into planet
    from spiritual.chaldean_order co
    where co.idx = planet_idx;

    hour_index := i;
    is_daytime := i < 12;

    if is_daytime then
      start_utc := p_sunrise + ((i * day_hour_ms) / 1000.0) * interval '1 second';
      end_utc := p_sunrise + (((i + 1) * day_hour_ms) / 1000.0) * interval '1 second';
    else
      start_utc := p_sunset + (((i - 12) * night_hour_ms) / 1000.0) * interval '1 second';
      if i < 23 then
        end_utc := p_sunset + (((i - 12 + 1) * night_hour_ms) / 1000.0) * interval '1 second';
      else
        end_utc := p_next_sunrise;
      end if;
    end if;

    return next;
  end loop;
end;
$$;

-- ---- planetary hours storage -----------------------------------

create table if not exists spiritual.planetary_hours (
  id bigint generated always as identity primary key,
  calc_date date not null,
  sunrise timestamptz not null,
  sunset timestamptz not null,
  next_sunrise timestamptz not null,
  day_ruler text not null,
  hours_json jsonb not null, -- full 24-hour array as JSONB
  calculated_by uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now()
);

create index if not exists idx_planetary_hours_date
  on spiritual.planetary_hours (calc_date desc);
create index if not exists idx_planetary_hours_tenant
  on spiritual.planetary_hours (tenant_id);

-- ---- planet positions (astrological/astronomical) --------------

create table if not exists spiritual.planet_positions (
  id bigint generated always as identity primary key,
  obs_date timestamptz not null,
  planet text not null check (planet in (
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto'
  )),

  -- Ecliptic coordinates
  longitude numeric(8,4),       -- degrees 0-360
  latitude numeric(8,4),        -- degrees -90 to 90
  distance_au numeric(12,6),    -- distance from Earth in AU

  -- Visibility / phase
  magnitude numeric(6,2),       -- apparent magnitude
  phase numeric(5,2),           -- illuminated fraction (0-1)
  constellation text,           -- zodiac constellation
  is_retrograde boolean default false,

  -- Right ascension / declination (equatorial)
  ra_hours numeric(6,3),        -- hours 0-24
  dec_degrees numeric(8,4),     -- degrees -90 to 90

  source text default 'api',    -- 'api', 'ephemeris', 'manual'
  calculated_by uuid references identity.profiles (id),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  unique (obs_date, planet)
);

create index if not exists idx_planet_positions_date
  on spiritual.planet_positions (obs_date desc);
create index if not exists idx_planet_positions_planet
  on spiritual.planet_positions (planet);
create index if not exists idx_planet_positions_tenant
  on spiritual.planet_positions (tenant_id);

-- ---- triggers --------------------------------------------------

drop trigger if exists set_planetary_hours_tenant on spiritual.planetary_hours;
create trigger set_planetary_hours_tenant before insert on spiritual.planetary_hours for each row
execute function spiritual.inject_tenant ();

drop trigger if exists planetary_hours_audit on spiritual.planetary_hours;
create trigger planetary_hours_audit
after insert or delete on spiritual.planetary_hours for each row
execute function audit.log_change ();

drop trigger if exists set_planet_positions_tenant on spiritual.planet_positions;
create trigger set_planet_positions_tenant before insert on spiritual.planet_positions for each row
execute function spiritual.inject_tenant ();

drop trigger if exists planet_positions_audit on spiritual.planet_positions;
create trigger planet_positions_audit
after insert or delete on spiritual.planet_positions for each row
execute function audit.log_change ();

-- ---- RLS ------------------------------------------------------

alter table spiritual.planetary_hours enable row level security;
alter table spiritual.planet_positions enable row level security;

-- planetary hours
drop policy if exists planetary_hours_read on spiritual.planetary_hours;
drop policy if exists planetary_hours_create on spiritual.planetary_hours;
drop policy if exists planetary_hours_delete on spiritual.planetary_hours;

create policy planetary_hours_read on spiritual.planetary_hours for select to authenticated using (
  (tenant_id = (select core.current_tenant()) or tenant_id is null)
  and (select rbac.authorize('planetary.read'))
);

create policy planetary_hours_create on spiritual.planetary_hours for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize('planetary.create'))
);

create policy planetary_hours_delete on spiritual.planetary_hours for delete to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize('planetary.delete'))
);

-- planet positions
drop policy if exists planet_positions_read on spiritual.planet_positions;
drop policy if exists planet_positions_create on spiritual.planet_positions;

create policy planet_positions_read on spiritual.planet_positions for select to authenticated using (
  (tenant_id = (select core.current_tenant()) or tenant_id is null)
  and (select rbac.authorize('astro.read'))
);

create policy planet_positions_create on spiritual.planet_positions for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize('astro.create'))
);

-- ---- API views -------------------------------------------------

drop view if exists api.planetary_hours;
create view api.planetary_hours
with (security_invoker = true) as
select
  ph.id,
  ph.calc_date,
  ph.day_ruler,
  ph.hours_json,
  ph.tenant_id,
  p.display_name as calculated_by
from
  spiritual.planetary_hours ph
  join identity.profiles p on p.id = ph.calculated_by;

drop view if exists api.planet_positions;
create view api.planet_positions
with (security_invoker = true) as
select
  pp.id,
  pp.obs_date,
  pp.planet,
  pp.longitude,
  pp.latitude,
  pp.constellation,
  pp.is_retrograde,
  pp.magnitude,
  pp.phase,
  pp.tenant_id,
  p.display_name as calculated_by
from
  spiritual.planet_positions pp
  join identity.profiles p on p.id = pp.calculated_by;
