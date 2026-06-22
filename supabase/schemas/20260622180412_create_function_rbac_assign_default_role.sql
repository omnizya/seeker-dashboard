create or replace function rbac.assign_default_role () returns trigger language plpgsql security definer
set
  search_path = rbac,
  public as $$
begin
  insert into rbac.user_roles(user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;
