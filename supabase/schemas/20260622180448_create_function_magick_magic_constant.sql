create or replace function magick.magic_constant (input_value integer) returns integer language sql immutable as $$ select input_value * 3 + 12; $$;
