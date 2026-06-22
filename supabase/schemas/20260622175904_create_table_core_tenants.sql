create table if not exists core.tenants (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);
