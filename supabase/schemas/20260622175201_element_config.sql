-- ---- element config (memoised lookup) -------------------------
-- Pre-computed packed permutations. Replaces magick.element_packed()
-- with a single index lookup instead of a CASE per call.

create table if not exists magick.element_config (
  element magick.element primary key,
  packed bigint not null,
  forward_packed bigint not null
);

insert into magick.element_config (element, packed, forward_packed) values
  ('aero', 23102523171, 18129162870),
  ('tera', 6499345671,  34732340370),
  ('igni', 30652269921, 19632846870),
  ('aqua', 15051548421, 35233568370)
on conflict (element) do update set
  packed = excluded.packed,
  forward_packed = excluded.forward_packed;
