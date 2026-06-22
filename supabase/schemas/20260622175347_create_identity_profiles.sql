create table if not exists identity.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  status public.user_status default 'OFFLINE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
