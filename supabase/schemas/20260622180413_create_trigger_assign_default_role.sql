drop trigger if exists assign_default_role_trigger on identity.profiles;
create trigger assign_default_role_trigger
after insert on identity.profiles for each row
execute function rbac.assign_default_role ();
