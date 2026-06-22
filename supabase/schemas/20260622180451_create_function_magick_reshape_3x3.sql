create or replace function magick.reshape_3x3 (cells integer[]) returns integer[] language sql immutable as $$ select array[ cells[1:3], cells[4:6], cells[7:9] ]; $$;
