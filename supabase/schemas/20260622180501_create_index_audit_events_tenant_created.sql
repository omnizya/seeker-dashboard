-- Primary query pattern: "events for tenant X, newest first"
create index if not exists idx_audit_events_tenant_created on audit.events (tenant_id, created_at desc);
