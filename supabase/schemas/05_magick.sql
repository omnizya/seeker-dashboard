-- ================================================================
-- MAGICK: square calculations, element geometry, validation
-- Depends on: 00_foundation, 01_identity, 02_core, 03_rbac
-- Also uses: spiritual.inject_tenant, audit.log_change
-- ================================================================

create table if not exists magick.square_calculations (
  id bigint generated always as identity primary key,
  element magick.element not null,
  input_value integer not null,
  output_square integer[] not null,
  magic_constant integer not null,
  calculated_by uuid not null references identity.profiles (id) default auth.uid (),
  tenant_id uuid references core.tenants (id),
  notes text,
  created_at timestamptz default now()
);

-- Composite index for API view: tenant-scoped listing by element
create index if not exists idx_square_calc_tenant_element
  on magick.square_calculations (tenant_id, element);

create index if not exists idx_square_calc_calculated_by
  on magick.square_calculations (calculated_by);

-- ---- functions ------------------------------------------------

-- Reads from magick.element_config (memoised in 00_foundation)
create or replace function magick.fill_square (el magick.element, input_value integer) returns integer[] language sql immutable as $$
  select array_agg(
    input_value + (k - 1)
    order by ((ec.packed >> ((k - 1) * 4)) & 15)
  )
  from generate_series(1, 9) as k
  cross join magick.element_config ec
  where ec.element = el;
$$;

create or replace function magick.magic_constant (input_value integer) returns integer language sql immutable as $$
  select input_value * 3 + 12;
$$;

create or replace function magick.compute_square () returns trigger language plpgsql as $$
begin
  new.output_square := magick.fill_square(new.element, new.input_value);
  new.magic_constant := magick.magic_constant(new.input_value);
  return new;
end;
$$;

create or replace function magick.unpack_cells (packed bigint) returns integer[] language sql immutable as $$
  select array_agg(((packed >> (4 * (i - 1))) & 15)::int order by i)
  from generate_series(1, 9) as i;
$$;

create or replace function magick.reshape_3x3 (cells integer[]) returns integer[] language sql immutable as $$
  select array[
    cells[1:3],
    cells[4:6],
    cells[7:9]
  ];
$$;

create or replace function magick.presence_mask (cells integer[]) returns integer language sql immutable as $$
  select bit_or(1 << v) from unnest(cells) as v;
$$;

create or replace function magick.is_valid_permutation (cells integer[]) returns boolean language sql immutable as $$
  select magick.presence_mask(cells) = 1022;
$$;

create or replace function magick.parity_cross (cells integer[]) returns integer[] language sql immutable as $$
  select magick.reshape_3x3(
    (select array_agg(v & 1 order by ord)
     from unnest(cells) with ordinality as u (v, ord))
  );
$$;

create or replace function magick.is_magic_square (cells integer[]) returns boolean language sql immutable as $$
  select array_length(cells, 1) = 9
  and (
    select count(distinct s) = 1
    from unnest(array[
      cells[1]+cells[2]+cells[3],
      cells[4]+cells[5]+cells[6],
      cells[7]+cells[8]+cells[9],
      cells[1]+cells[4]+cells[7],
      cells[2]+cells[5]+cells[8],
      cells[3]+cells[6]+cells[9],
      cells[1]+cells[5]+cells[9],
      cells[3]+cells[5]+cells[7]
    ]) as s
  );
$$;

-- ---- triggers -------------------------------------------------

drop trigger if exists set_square_computed on magick.square_calculations;
create trigger set_square_computed before insert on magick.square_calculations for each row
execute function magick.compute_square ();

drop trigger if exists set_square_calc_tenant on magick.square_calculations;
create trigger set_square_calc_tenant before insert on magick.square_calculations for each row
execute function spiritual.inject_tenant ();

drop trigger if exists square_calc_audit on magick.square_calculations;
create trigger square_calc_audit
after insert or delete on magick.square_calculations for each row
execute function audit.log_change ();

-- ---- API view -------------------------------------------------

drop view if exists api.square_calculations;
create view api.square_calculations
with (security_invoker = true) as
select
  sc.id,
  sc.element,
  sc.input_value,
  sc.output_square,
  sc.magic_constant,
  sc.tenant_id,
  p.display_name as calculated_by
from
  magick.square_calculations sc
  join identity.profiles p on p.id = sc.calculated_by;

-- ---- RLS ------------------------------------------------------

alter table magick.square_calculations enable row level security;

drop policy if exists square_calc_read on magick.square_calculations;
drop policy if exists square_calc_create on magick.square_calculations;
drop policy if exists square_calc_delete on magick.square_calculations;

create policy square_calc_read on magick.square_calculations for select to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('magick.read'))
);

create policy square_calc_create on magick.square_calculations for insert to authenticated
with check (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('magick.create'))
);

create policy square_calc_delete on magick.square_calculations for delete to authenticated using (
  tenant_id = (select core.current_tenant())
  and (select rbac.authorize ('magick.delete'))
);
