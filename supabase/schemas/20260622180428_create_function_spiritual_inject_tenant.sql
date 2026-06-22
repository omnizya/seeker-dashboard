create or replace function spiritual.inject_tenant () returns trigger language plpgsql as $$
begin if new.tenant_id is null then new.tenant_id := core.current_tenant(); end if; if new.tenant_id is null then raise exception 'Tenant context missing'; end if; return new; end; $$;
