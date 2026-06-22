create or replace function rbac.is_grand_master () returns boolean language sql stable security definer
set
  search_path = rbac,
  auth,
  public as $$
  select exists (
    select 1
    from rbac.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'grand_master'
  );
$$;
