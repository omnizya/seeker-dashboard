create table if not exists spiritual.prayer_methods ( id text primary key, name text not null, description text, fajr_angle numeric(4,1) not null, isha_angle numeric(4,1), isha_interval_min smallint, maghrib_angle numeric(4,1) default 0.0, maghrib_interval_min smallint, asr_standard boolean default true );

insert into spiritual.prayer_methods (id, name, description, fajr_angle, isha_angle, isha_interval_min) values
('mwl', 'Muslim World League', 'Standard method, widely used', 18.0, 17.0, null),
('egyptian', 'Egyptian General Authority', 'Used in Africa, Middle East', 19.5, 17.5, null),
('karachi', 'Karachi University', 'Used in Pakistan, Bangladesh', 18.0, 18.0, null),
('umm_al_qura', 'Umm al-Qura, Makkah', 'Saudi Arabia', 18.5, null, 90),
('dubai', 'Dubai', 'UAE', 18.2, 18.2, null),
('qatar', 'Qatar', 'Qatar', 18.0, null, 90),
('kuwait', 'Kuwait', 'Kuwait', 18.0, 17.5, null),
('tehran', 'Tehran', 'Iran', 17.7, 14.0, null),
('jafari', 'Jafari / Shia', 'Shia Ithna Ashari', 16.0, 14.0, null)
on conflict (id) do update set fajr_angle = excluded.fajr_angle, isha_angle = excluded.isha_angle, isha_interval_min = excluded.isha_interval_min;
