-- Secondary: "events by actor"
create index if not exists idx_audit_events_actor_id on audit.events (actor_id);
