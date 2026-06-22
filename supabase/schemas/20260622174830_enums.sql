create type public.user_status as enum('ONLINE', 'OFFLINE');

create type rbac.app_role as enum (
'grand_master', 'master', 'teacher', 'student', 'user');

create type rbac.app_permission as enum(
  'holy_names.read',
  'holy_names.create',
  'holy_names.update',
  'holy_names.delete',
  'abjad.read',
  'abjad.create',
  'abjad.delete',
  'magick.read',
  'magick.create',
  'magick.delete',
  'users.manage',
  'audit.read'
);

create type magick.element as enum ('aero', 'tera', 'igni', 'aqua');
