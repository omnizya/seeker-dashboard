
alter table identity.profiles enable row level security;

drop policy if exists profiles_read on identity.profiles;
drop policy if exists profiles_self_update on identity.profiles;
