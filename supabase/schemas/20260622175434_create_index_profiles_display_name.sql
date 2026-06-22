-- Covering index for API views that join profiles on id -> display_name
-- Avoids heap fetch for the most common view query pattern
create index if not exists idx_profiles_id_display_name
  on identity.profiles (id) include (display_name);
