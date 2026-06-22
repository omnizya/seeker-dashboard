create table if not exists spiritual.day_rulers ( day_of_week smallint primary key check (day_of_week between 0 and 6), planet text not null );
insert into spiritual.day_rulers (day_of_week, planet) values (0, 'Sun'), (1, 'Moon'), (2, 'Mars'), (3, 'Mercury'), (4, 'Jupiter'), (5, 'Venus'), (6, 'Saturn') on conflict (day_of_week) do nothing;
