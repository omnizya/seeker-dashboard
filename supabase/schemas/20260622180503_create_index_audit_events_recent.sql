-- Partial index for hot recent data (last 7 days)
-- Covers the most common dashboard query without scanning old partitions
create index if not exists idx_audit_events_recent on audit.events (tenant_id, created_at desc) where created_at > now() - interval '7 days';
