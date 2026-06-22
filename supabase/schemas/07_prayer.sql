-- ================================================================
-- PRAYER: prayer times calculation, user preferences, methods
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- ================================================================

-- ---- extended permissions (add to rbac.app_permission) ---------
-- These are appended via ALTER TYPE since the enum already exists.
-- Run this block before tables that reference new permissions.

do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = (
    select oid from pg_type where typname = 'app_permission' and nspname = 'rbac'
  ) and enumlabel = 'prayer.read') then
    alter type rbac.app_permission add value 'prayer.read';
    alter type rbac.app_permission add value 'prayer.create';
    alter type rbac.app_permission add value 'prayer.delete';
    alter type rbac.app_permission add value 'preferences.update';
    alter type rbac.app_permission add value 'planetary.read';
    alter type rbac.app_permission add value 'planetary.create';
    alter type rbac.app_permission add value 'planetary.delete';
  end if;
end$$;

-- ---- user preferences ------------------------------------------

create table if not exists identity.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references identity.profiles (id) on delete cascade unique,
  language text default 'ar' check (language in ('ar', 'en')),
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  prayer_method text default 'mwl' check (prayer_method in (
    'mwl',       -- Muslim World League: Fajr -18°, Isha -17°
    'egyptian',  -- Egyptian General Authority: Fajr -19.5°, Isha -17.5°
    'karachi',   -- University of Islamic Sciences, Karachi: Fajr -18°, Isha -18°
    'umm_al_qura',-- Umm al-Qura, Makkah: Fajr -18.5°, Isha -- (90 min after Maghrib)
    'dubai',     -- Dubai: Fajr -18.2°, Isha -18.2°
    'qatar',     -- Qatar: Fajr -18°, Isha -- (90 min after Maghrib)
    'kuwait',    -- Kuwait: Fajr -18°, Isha -17.5°
    'tehran',    -- Tehran: Fajr -17.7°, Isha -14° (Maghrib + 4 min)
    'jafari',    -- Shia Ithna Ashari, Leva Institute: Fajr -16°, Isha -14°
    'custom'     -- User-specified angles (stored in asr_method, fajr_angle, isha_angle)
  )),
  asr_method text default 'standard' check (asr_method in ('standard', 'hanafi')),
  fajr_angle numeric(4,1) default 18.0,
  isha_angle numeric(4,1) default 17.0,
  latitude numeric(9,6),
  longitude numeric(9,6),
  timezone text default 'UTC',
  hijri_adjustment smallint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---- prayer time calculation methods reference -----------------

create table if not exists spiritual.prayer_methods (
  id text primary key,
  name text not null,
  description text,
  fajr_angle numeric(4,1) not null,
  isha_angle numeric(4,1),
  isha_interval_min smallint, -- minutes after maghrib (overrides isha_angle if set)
  maghrib_angle numeric(4,1) default 0.0,
  maghrib_interval_min smallint, -- minutes after sunset (overrides angle)
  asr_standard boolean default true
);

insert into spiritual.prayer_methods (id, name, description, fajr_angle, isha_angle, isha_interval_min) values
  ('mwl',        'Muslim World League',          'Standard method, widely used', 18.0, 17.0, null),
  ('egyptian',   'Egyptian General Authority',   'Used in Africa, Middle East', 19.5, 17.5, null),
  ('karachi',    'Karachi University',           'Used in Pakistan, Bangladesh', 18.0, 18.0, null),
  ('umm_al_qura','Umm al-Qura, Makkah',          'Saudi Arabia', 18.5, null, 90),
  ('dubai',      'Dubai',                        'UAE', 18.2, 18.2, null),
  ('qatar',      'Qatar',                        'Qatar', 18.0, null, 90),
  ('kuwait',     'Kuwait',                       'Kuwait', 18.0, 17.5, null),
  ('tehran',     'Tehran',                       'Iran', 17.7, 14.0, null),
  ('jafari',     'Jafari / Shia',                'Shia Ithna Ashari', 16.0, 14.0, null)
on conflict (id) do update set
  fajr_angle = excluded.fajr_angle,
  isha_angle = excluded.isha_angle,
  isha_interval_min = excluded.isha_interval_min;

-- ---- prayer times calculations ---------------------------------

create table if not exists spiritual.prayer_times (
  id bigint generated always as identity primary key,
  calc_date date not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  method text not null references spiritual.prayer_methods (id),

  -- The five prayers (ISO timestamps)
  fajr timestamptz not null,
  sunrise timestamptz not null,
  dhuhr timestamptz not null,
  asr timestamptz not null,
  maghrib timestamptz not null,
  isha timestamptz not null,

  -- Additional angles (for reference / custom methods)
  fajr_angle numeric(4,1) not null,
  isha_angle numeric(4,1),
  asr_method text not null default 'standard',

  calculated_by uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  notes text,
  created_at timestamptz default now(),
  unique (calc_date, latitude, longitude, method)
);

create index if not exists idx_prayer_times_date
  on spiritual.prayer_times (calc_date desc);
create index if not exists idx_prayer_times_coords
  on spiritual.prayer_times (latitude, longitude);
create index if not exists idx_prayer_times_tenant
  on spiritual.prayer_times (tenant_id);

-- ---- compute prayer times (trigonometric) ----------------------
-- Based on the solar position algorithm. Returns a single row.
-- Angles are in degrees, times in UTC.

create or replace function spiritual.sun_declination (d timestamp) returns numeric
language sql immutable as $$
  -- Approximate solar declination for a given date
  select 23.44 * sin(radians(360.0 / 365.0 * (extract(doy from d) - 81)));
$$;

create or replace function spiritual.equation_of_time (d timestamp) returns numeric
language sql immutable as $$
  -- Approximate equation of time in minutes
  select 229.2 * (0.000075 + 0.001868 * cos(radians(360.0 / 365.0 * (extract(doy from d) - 1)))
    - 0.032077 * sin(radians(360.0 / 365.0 * (extract(doy from d) - 1)))
    - 0.014615 * cos(radians(720.0 / 365.0 * (extract(doy from d) - 1)))
    - 0.04089 * sin(radians(720.0 / 365.0 * (extract(doy from d) - 1))));
$$;

create or replace function spiritual.solar_noon (
  d timestamp,
  lon numeric
) returns timestamptz
language sql immutable as $$
  -- Solar noon in UTC: 12:00 - equation_of_time - longitude_correction
  select d::date + interval '12 hours'
    - (spiritual.equation_of_time(d) / 1440.0)::interval
    - (lon / 360.0 * 24 * 60 / 1440.0)::interval;
$$;

create or replace function spiritual.hour_angle (
  latitude numeric,
  declination numeric,
  angle numeric
) returns numeric
language sql immutable as $$
  -- Hour angle at which the sun reaches a given altitude
  -- acos((sin(angle) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec)))
  select degrees(acos(
    (sin(radians(angle)) - sin(radians(latitude)) * sin(radians(declination)))
    / (cos(radians(latitude)) * cos(radians(declination)))
  ));
$$;

create or replace function spiritual.compute_prayer_times (
  p_date date,
  p_lat numeric,
  p_lon numeric,
  p_tz text default 'UTC',
  p_fajr_angle numeric default 18.0,
  p_isha_angle numeric default 17.0,
  p_asr_method text default 'standard'
) returns jsonb
language plpgsql stable as $$
declare
  d timestamptz := p_date::timestamptz;
  dec numeric;
  eot_min numeric;
  noon timestamptz;
  sunrise_ha numeric;
  asr_factor numeric;
  asr_angle numeric;
  duration_day interval;
  result jsonb;
begin
  dec := spiritual.sun_declination(d);
  eot_min := spiritual.equation_of_time(d);
  noon := spiritual.solar_noon(d, p_lon);

  -- Sunrise / Sunset hour angle
  sunrise_ha := spiritual.hour_angle(p_lat, dec, -0.833);

  -- Asr: shadow length factor (1 for standard, 2 for hanafi)
  asr_factor := case when p_asr_method = 'hanafi' then 2.0 else 1.0 end;
  asr_angle := degrees(atan(asr_factor + tan(radians(abs(p_lat - dec)))));

  -- Duration of daylight
  duration_day := interval '1 day' * (2 * sunrise_ha / 360.0);
  -- Use 2 * sunrise_ha / 360 as fraction of day

  result := jsonb_build_object(
    'date', p_date,
    'latitude', p_lat,
    'longitude', p_lon,
    'method', jsonb_build_object(
      'fajr_angle', p_fajr_angle,
      'isha_angle', p_isha_angle,
      'asr_method', p_asr_method
    ),
    'fajr', (noon - (spiritual.hour_angle(p_lat, dec, p_fajr_angle) / 360.0 * interval '1 day')::interval) at time zone p_tz,
    'sunrise', (noon - (sunrise_ha / 360.0 * interval '1 day')::interval) at time zone p_tz,
    'dhuhr', noon at time zone p_tz,
    'asr', (noon + (spiritual.hour_angle(p_lat, dec, asr_angle) / 360.0 * interval '1 day')::interval) at time zone p_tz,
    'maghrib', (noon + (sunrise_ha / 360.0 * interval '1 day')::interval) at time zone p_tz,
    'isha', (noon + (spiritual.hour_angle(p_lat, dec, p_isha_angle) / 360.0 * interval '1 day')::interval) at time zone p_tz
  );

  return result;
end;
$$;

-- ---- computed column helper ------------------------------------

create or replace function spiritual.compute_and_store_prayer_times (
  p_date date,
  p_lat numeric,
  p_lon numeric,
  p_method text default 'mwl'
) returns jsonb
language plpgsql security definer
set search_path = spiritual, public
as $$
declare
  method_row spiritual.prayer_methods;
  result jsonb;
  fa_angle numeric;
  is_angle numeric;
  is_int smallint;
  asr_m text;
begin
  select * into method_row from spiritual.prayer_methods where id = p_method;
  if not found then
    raise exception 'Unknown prayer method: %', p_method;
  end if;

  fa_angle := method_row.fajr_angle;

  -- Isha: use interval override if defined
  if method_row.isha_interval_min is not null then
    -- Compute isha as maghrib + interval (approximate here)
    is_angle := method_row.isha_angle;
  else
    is_angle := method_row.isha_angle;
  end if;

  asr_m := case when method_row.asr_standard then 'standard' else 'hanafi' end;

  result := spiritual.compute_prayer_times(p_date, p_lat, p_lon, 'UTC', fa_angle, is_angle, asr_m);

  return result;
end;
$$;

-- ---- triggers --------------------------------------------------

drop trigger if exists set_prayer_times_tenant on spiritual.prayer_times;
create trigger set_prayer_times_tenant before insert on spiritual.prayer_times for each row
execute function spiritual.inject_tenant ();

drop trigger if exists prayer_times_audit on spiritual.prayer_times;
create trigger prayer_times_audit
after insert or delete on spiritual.prayer_times for each row
execute function audit.log_change ();

drop trigger if exists user_preferences_updated on identity.user_preferences;
create trigger user_preferences_updated before
update on identity.user_preferences for each row
execute function internal.touch_updated_at ();

-- ---- RLS ------------------------------------------------------

alter table identity.user_preferences enable row level security;
alter table spiritual.prayer_times enable row level security;
alter table spiritual.prayer_methods enable row level security;

-- user_preferences: each user reads/writes their own
drop policy if exists user_preferences_read on identity.user_preferences;
drop policy if exists user_preferences_upsert on identity.user_preferences;

create policy user_preferences_read on identity.user_preferences for select to authenticated using (
  user_id = (select auth.uid())
);

create policy user_preferences_upsert on identity.user_preferences for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select rbac.authorize('preferences.update'))
);

-- prayer times: tenant-scoped
drop policy if exists prayer_times_read on spiritual.prayer_times;
drop policy if exists prayer_times_create on spiritual.prayer_times;
drop policy if exists prayer_times_delete on spiritual.prayer_times;

create policy prayer_times_read on spiritual.prayer_times for select to authenticated using (
  (tenant_id = (select core.current_tenant()) or tenant_id is null)
  and (select rbac.authorize('prayer.read'))
);

create policy prayer_times_create on spiritual.prayer_times for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize('prayer.create'))
);

create policy prayer_times_delete on spiritual.prayer_times for delete to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize('prayer.delete'))
);

-- prayer methods: readable by all authenticated
drop policy if exists prayer_methods_read on spiritual.prayer_methods;
create policy prayer_methods_read on spiritual.prayer_methods for select to authenticated using (true);

-- ---- API views -------------------------------------------------

drop view if exists api.prayer_times;
create view api.prayer_times
with (security_invoker = true) as
select
  pt.id,
  pt.calc_date,
  pt.latitude,
  pt.longitude,
  pt.method,
  pt.fajr,
  pt.sunrise,
  pt.dhuhr,
  pt.asr,
  pt.maghrib,
  pt.isha,
  pt.tenant_id,
  p.display_name as calculated_by
from
  spiritual.prayer_times pt
  join identity.profiles p on p.id = pt.calculated_by;
