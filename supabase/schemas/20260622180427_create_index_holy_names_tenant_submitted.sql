-- Composite index for API view join + RLS tenant filter
create index if not exists idx_holy_names_tenant_submitted on spiritual.holy_names (tenant_id, submitted_by);
