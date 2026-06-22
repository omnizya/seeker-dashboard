create or replace function identity.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = identity,
  public as $$
begin
  insert into identity.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '')
  );

  return new;
end;
$$;
