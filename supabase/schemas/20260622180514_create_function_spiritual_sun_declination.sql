create or replace function spiritual.sun_declination (d timestamp) returns numeric language sql immutable as $$ select 23.44 * sin(radians(360.0 / 365.0 * (extract(doy from d) - 81))); $$;
