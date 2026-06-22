-- Composite index for recent audit queries (tenant_id + created_at DESC)
-- Partial index with now() rejected: PostgreSQL requires IMMUTABLE in index predicates.
-- Plain composite index achieves the same scan-avoidance for dashboard queries.
create index if not exists idx_audit_events_recent on audit.events (tenant_id, created_at desc);
