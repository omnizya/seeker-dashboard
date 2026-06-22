drop trigger if exists holy_names_updated on spiritual.holy_names; create trigger holy_names_updated before update on spiritual.holy_names for each row execute function internal.touch_updated_at ();
