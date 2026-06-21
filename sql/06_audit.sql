-- ================================================================
-- AUDIT: event logging, change trigger
-- Depends on: 00_foundation
-- ================================================================

create table if not exists audit.events (
  id bigint generated always as identity primary key,
  tenant_id uuid,
  actor_id uuid,
  table_name text,
  operation text,
  record_id text,
  payload jsonb,
  created_at timestamptz default now()
);

-- Primary query pattern: "events for tenant X, newest first"
create index if not exists idx_audit_events_tenant_created
  on audit.events (tenant_id, created_at desc);

-- Secondary: "events by actor"
create index if not exists idx_audit_events_actor_id
  on audit.events (actor_id);

-- Partial index for hot recent data (last 7 days)
-- Covers the most common dashboard query without scanning old partitions
create index if not exists idx_audit_events_recent
  on audit.events (tenant_id, created_at desc)
  where created_at > now() - interval '7 days';

-- ---- functions ------------------------------------------------

create or replace function audit.log_change () returns trigger language plpgsql security definer
set
  search_path = audit,
  public as $$
begin
  insert into audit.events (
    tenant_id,
    actor_id,
    table_name,
    operation,
    record_id,
    payload
  )
  values (
    coalesce(new.tenant_id, old.tenant_id),
    auth.uid(),
    tg_table_name,
    tg_op,
    coalesce(new.id, old.id)::text,
    case
      when tg_op = 'DELETE' then to_jsonb(old)
      else to_jsonb(new)
    end
  );

  return coalesce(new, old);
end;
$$;

-- ---- RLS ------------------------------------------------------

alter table audit.events enable row level security;

drop policy if exists audit_events_read on audit.events;

create policy audit_events_read on audit.events for select to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('audit.read'))
);
