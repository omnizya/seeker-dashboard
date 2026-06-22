create table if not exists spiritual.chaldean_order ( idx smallint primary key check (idx between 0 and 6), planet text not null unique );
insert into spiritual.chaldean_order (idx, planet) values (0, 'Saturn'), (1, 'Jupiter'), (2, 'Mars'), (3, 'Sun'), (4, 'Venus'), (5, 'Mercury'), (6, 'Moon') on conflict (idx) do nothing;
