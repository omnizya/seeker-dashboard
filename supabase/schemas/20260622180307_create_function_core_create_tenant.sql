
create or replace function core.create_tenant (p_name text, p_slug text) returns uuid language plpgsql security invoker
set
  search_path = core,
  public as $$
declare
  t_id uuid := gen_random_uuid();
begin
  insert into core.tenants(id, name, slug)
  values (t_id, p_name, p_slug);

  insert into core.tenant_memberships(tenant_id, user_id, role)
  values (t_id, auth.uid(), 'master');

  return t_id;
end;
$$;
