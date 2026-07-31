-- CRITICAL FIX: dua_entries_read policy leaks private dua content
-- Previous: using (true) — any authenticated user reads ALL dua entries
-- Fix: Check if parent dua_lists.is_public OR user is the owner

drop policy if exists dua_entries_read on spiritual.dua_entries;

create policy dua_entries_read on spiritual.dua_entries for select to authenticated using (
  exists (
    select 1
    from spiritual.dua_lists dl
    where dl.id = dua_entries.list_id
      and (dl.is_public = true or dl.owner = auth.uid())
  )
);
