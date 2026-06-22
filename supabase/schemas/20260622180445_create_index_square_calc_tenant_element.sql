-- Composite index for API view: tenant-scoped listing by element
create index if not exists idx_square_calc_tenant_element on magick.square_calculations (tenant_id, element);
