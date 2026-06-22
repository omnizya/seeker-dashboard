alter table audit.events enable row level security; drop policy if exists audit_events_read on audit.events;
