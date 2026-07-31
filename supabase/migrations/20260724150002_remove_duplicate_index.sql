-- MEDIUM FIX: Remove duplicate index idx_audit_events_recent
-- Identical to idx_audit_events_tenant_created (tenant_id, created_at desc)
-- Pure write-cost waste

drop index if exists audit.idx_audit_events_recent;
