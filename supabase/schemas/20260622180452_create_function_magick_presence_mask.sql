create or replace function magick.presence_mask (cells integer[]) returns integer language sql immutable as $$ select bit_or(1 << v) from unnest(cells) as v; $$;
