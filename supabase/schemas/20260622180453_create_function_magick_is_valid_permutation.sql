create or replace function magick.is_valid_permutation (cells integer[]) returns boolean language sql immutable as $$ select magick.presence_mask(cells) = 1022; $$;
