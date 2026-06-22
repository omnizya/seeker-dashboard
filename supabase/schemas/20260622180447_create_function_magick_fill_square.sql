-- Reads from magick.element_config (memoised in 00_foundation)
create or replace function magick.fill_square (el magick.element, input_value integer) returns integer[] language sql immutable as $$ select array_agg( input_value + (k - 1) order by ((ec.packed >> ((k - 1) * 4)) & 15) ) from generate_series(1, 9) as k cross join magick.element_config ec where ec.element = el; $$;
