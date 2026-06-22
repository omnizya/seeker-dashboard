-- ================================================================
-- FEATURES: tasbih, quran bookmarks, spiritual journal, dua lists
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- ================================================================

-- ---- extended permissions --------------------------------------

do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = (
    select oid from pg_type where typname = 'app_permission' and nspname = 'rbac'
  ) and enumlabel = 'tasbih.read') then
    alter type rbac.app_permission add value 'tasbih.read';
    alter type rbac.app_permission add value 'tasbih.create';
    alter type rbac.app_permission add value 'tasbih.delete';
    alter type rbac.app_permission add value 'bookmarks.read';
    alter type rbac.app_permission add value 'bookmarks.create';
    alter type rbac.app_permission add value 'bookmarks.delete';
    alter type rbac.app_permission add value 'journal.read';
    alter type rbac.app_permission add value 'journal.create';
    alter type rbac.app_permission add value 'journal.update';
    alter type rbac.app_permission add value 'journal.delete';
  end if;
end$$;

-- ---- tasbih (dhikr counter) ------------------------------------

create table if not exists spiritual.tasbih_presets (
  id bigint generated always as identity primary key,
  phrase text not null,
  transliteration text,
  translation text,
  default_count smallint not null default 33,
  category text default 'general' check (category in (
    'general', 'morning', 'evening', 'prayer', 'ramadan', 'custom'
  )),
  sort_order smallint default 0
);

insert into spiritual.tasbih_presets (phrase, transliteration, translation, default_count, category, sort_order) values
  ('سُبْحَانَ اللَّهِ',        'SubhanAllah',      'Glory be to Allah',           33, 'general', 1),
  ('الْحَمْدُ لِلَّهِ',        'Alhamdulillah',    'Praise be to Allah',          33, 'general', 2),
  ('اللَّهُ أَكْبَرُ',         'Allahu Akbar',     'Allah is the Greatest',       34, 'general', 3),
  ('لَا إِلٰهَ إِلَّا اللَّهُ', 'La ilaha illAllah','There is no god but Allah',   100, 'general', 4),
  ('أَسْتَغْفِرُ اللَّهَ',     'Astaghfirullah',   'I seek forgiveness from Allah', 33, 'general', 5),
  ('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'SubhanAllahi wa bihamdihi', 'Glory be to Allah and His praise', 100, 'morning', 6),
  ('لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', 'La hawla wa la quwwata illa billah', 'There is no power except from Allah', 100, 'general', 7)
on conflict do nothing;

create table if not exists spiritual.tasbih_sessions (
  id bigint generated always as identity primary key,
  preset_id bigint references spiritual.tasbih_presets (id),
  custom_phrase text,
  target_count integer not null default 33,
  completed_count integer not null default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_seconds integer,    -- time taken to complete
  category text default 'general',
  user_id uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now()
);

create index if not exists idx_tasbih_sessions_user
  on spiritual.tasbih_sessions (user_id, started_at desc);
create index if not exists idx_tasbih_sessions_tenant
  on spiritual.tasbih_sessions (tenant_id);

-- ---- quran bookmarks -------------------------------------------

create table if not exists spiritual.quran_bookmarks (
  id bigint generated always as identity primary key,
  ayah_id integer not null,
  surah_id smallint,
  ayah_number smallint,
  -- The actual ayah text cached at time of bookmarking
  ayah_text text,
  label text,
  tags text[],
  color text,  -- highlight color
  user_id uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, ayah_id)
);

create index if not exists idx_quran_bookmarks_user
  on spiritual.quran_bookmarks (user_id, created_at desc);
create index if not exists idx_quran_bookmarks_surah
  on spiritual.quran_bookmarks (surah_id);
create index if not exists idx_quran_bookmarks_tenant
  on spiritual.quran_bookmarks (tenant_id);

-- ---- spiritual journal -----------------------------------------

create table if not exists spiritual.spiritual_journal (
  id bigint generated always as identity primary key,
  entry_date date not null default current_date,
  title text,
  content text not null,
  entry_type text default 'reflection' check (entry_type in (
    'reflection',   -- تأمل
    'dream',        -- رؤيا
    'gratitude',    -- شكر
    'goal',         -- هدف روحي
    'lesson',       -- درس
    'prayer',       -- دعاء
    'custom'
  )),
  mood text,                     -- user's mood/state
  tags text[],
  is_private boolean default true,
  linked_ayah_id integer,        -- optional link to a Quran verse
  user_id uuid not null references identity.profiles (id) default auth.uid(),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_spiritual_journal_user
  on spiritual.spiritual_journal (user_id, entry_date desc);
create index if not exists idx_spiritual_journal_type
  on spiritual.spiritual_journal (entry_type);
create index if not exists idx_spiritual_journal_tenant
  on spiritual.spiritual_journal (tenant_id);

-- ---- dua (supplication) lists ----------------------------------

create table if not exists spiritual.dua_lists (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  category text check (category in (
    'morning', 'evening', 'sleep', 'waking', 'eating', 'travel',
    'prayer', 'ramadan', 'hajj', 'protection', 'provision', 'forgiveness', 'custom'
  )),
  source text,        -- Quran reference or hadith source
  is_public boolean default true,
  user_id uuid references identity.profiles (id),
  tenant_id uuid references core.tenants (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists spiritual.dua_entries (
  id bigint generated always as identity primary key,
  list_id bigint not null references spiritual.dua_lists (id) on delete cascade,
  arabic text not null,
  transliteration text,
  translation text,
  benefit text,
  sort_order smallint default 0,
  created_at timestamptz default now()
);

create index if not exists idx_dua_entries_list
  on spiritual.dua_entries (list_id, sort_order);
create index if not exists idx_dua_lists_tenant
  on spiritual.dua_lists (tenant_id);

-- ---- triggers --------------------------------------------------

drop trigger if exists set_tasbih_sessions_tenant on spiritual.tasbih_sessions;
create trigger set_tasbih_sessions_tenant before insert on spiritual.tasbih_sessions for each row
execute function spiritual.inject_tenant ();

drop trigger if exists set_quran_bookmarks_tenant on spiritual.quran_bookmarks;
create trigger set_quran_bookmarks_tenant before insert on spiritual.quran_bookmarks for each row
execute function spiritual.inject_tenant ();

drop trigger if exists set_spiritual_journal_tenant on spiritual.spiritual_journal;
create trigger set_spiritual_journal_tenant before insert on spiritual.spiritual_journal for each row
execute function spiritual.inject_tenant ();

drop trigger if exists quran_bookmarks_updated on spiritual.quran_bookmarks;
create trigger quran_bookmarks_updated before
update on spiritual.quran_bookmarks for each row
execute function internal.touch_updated_at ();

drop trigger if exists spiritual_journal_updated on spiritual.spiritual_journal;
create trigger spiritual_journal_updated before
update on spiritual.spiritual_journal for each row
execute function internal.touch_updated_at ();

-- ---- RLS ------------------------------------------------------

alter table spiritual.tasbih_presets enable row level security;
alter table spiritual.tasbih_sessions enable row level security;
alter table spiritual.quran_bookmarks enable row level security;
alter table spiritual.spiritual_journal enable row level security;
alter table spiritual.dua_lists enable row level security;
alter table spiritual.dua_entries enable row level security;

-- tasbih presets: public read
drop policy if exists tasbih_presets_read on spiritual.tasbih_presets;
create policy tasbih_presets_read on spiritual.tasbih_presets for select to authenticated using (true);

-- tasbih sessions: user-scoped
drop policy if exists tasbih_sessions_read on spiritual.tasbih_sessions;
drop policy if exists tasbih_sessions_create on spiritual.tasbih_sessions;
drop policy if exists tasbih_sessions_delete on spiritual.tasbih_sessions;

create policy tasbih_sessions_read on spiritual.tasbih_sessions for select to authenticated using (
  (user_id = (select auth.uid()) or tenant_id = (select core.current_tenant()))
  and (select rbac.authorize('tasbih.read'))
);

create policy tasbih_sessions_create on spiritual.tasbih_sessions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select rbac.authorize('tasbih.create'))
);

-- quran bookmarks: user-scoped
drop policy if exists quran_bookmarks_read on spiritual.quran_bookmarks;
drop policy if exists quran_bookmarks_create on spiritual.quran_bookmarks;
drop policy if exists quran_bookmarks_delete on spiritual.quran_bookmarks;

create policy quran_bookmarks_read on spiritual.quran_bookmarks for select to authenticated using (
  user_id = (select auth.uid())
  and (select rbac.authorize('bookmarks.read'))
);

create policy quran_bookmarks_create on spiritual.quran_bookmarks for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select rbac.authorize('bookmarks.create'))
);

create policy quran_bookmarks_delete on spiritual.quran_bookmarks for delete to authenticated using (
  user_id = (select auth.uid())
  and (select rbac.authorize('bookmarks.delete'))
);

-- journal: user-scoped
drop policy if exists spiritual_journal_read on spiritual.spiritual_journal;
drop policy if exists spiritual_journal_create on spiritual.spiritual_journal;
drop policy if exists spiritual_journal_update on spiritual.spiritual_journal;
drop policy if exists spiritual_journal_delete on spiritual.spiritual_journal;

create policy spiritual_journal_read on spiritual.spiritual_journal for select to authenticated using (
  user_id = (select auth.uid())
  and (select rbac.authorize('journal.read'))
);

create policy spiritual_journal_create on spiritual.spiritual_journal for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select rbac.authorize('journal.create'))
);

create policy spiritual_journal_update on spiritual.spiritual_journal for update to authenticated using (
  user_id = (select auth.uid())
  and (select rbac.authorize('journal.update'))
)
with check (
  user_id = (select auth.uid())
  and (select rbac.authorize('journal.update'))
);

create policy spiritual_journal_delete on spiritual.spiritual_journal for delete to authenticated using (
  user_id = (select auth.uid())
  and (select rbac.authorize('journal.delete'))
);

-- dua lists: public reads, user-scoped writes
drop policy if exists dua_lists_read on spiritual.dua_lists;
drop policy if exists dua_lists_create on spiritual.dua_lists;

create policy dua_lists_read on spiritual.dua_lists for select to authenticated using (
  is_public = true or user_id = (select auth.uid())
);

create policy dua_lists_create on spiritual.dua_lists for insert to authenticated
with check (user_id = (select auth.uid()));

-- dua entries: inherit from parent list
drop policy if exists dua_entries_read on spiritual.dua_entries;
create policy dua_entries_read on spiritual.dua_entries for select to authenticated using (true);

-- ---- API views -------------------------------------------------

drop view if exists api.quran_bookmarks;
create view api.quran_bookmarks
with (security_invoker = true) as
select
  qb.id,
  qb.ayah_id,
  qb.surah_id,
  qb.ayah_number,
  qb.ayah_text,
  qb.label,
  qb.tags,
  qb.color,
  qb.user_id,
  qb.created_at
from
  spiritual.quran_bookmarks qb;

drop view if exists api.spiritual_journal;
create view api.spiritual_journal
with (security_invoker = true) as
select
  sj.id,
  sj.entry_date,
  sj.title,
  sj.content,
  sj.entry_type,
  sj.mood,
  sj.tags,
  sj.user_id,
  sj.created_at,
  sj.updated_at
from
  spiritual.spiritual_journal sj;

drop view if exists api.tasbih_sessions;
create view api.tasbih_sessions
with (security_invoker = true) as
select
  ts.id,
  ts.preset_id,
  ts.custom_phrase,
  ts.target_count,
  ts.completed_count,
  ts.started_at,
  ts.completed_at,
  ts.duration_seconds,
  ts.category,
  ts.user_id
from
  spiritual.tasbih_sessions ts;
