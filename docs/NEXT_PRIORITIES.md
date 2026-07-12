# Next High Priorities

> Prioritized work items extracted from project memory (2026-06-22)

## 1. Admin Dashboard

**Routes:** `/dashboard/admin/users`, `/dashboard/admin/invites`, `/dashboard/admin/roles`

Build a super admin dashboard for managing users, invitations, and roles. Requires:
- `grand_master` role (already added to `rbac.app_role` enum)
- New pages under `/dashboard/admin/`
- shadcn/ui components (Table, Card, Dialog, Badge)
- RTL-compatible layout

## 2. Invitations Table

**Schema:** `admin.invitations`

```sql
create table if not exists admin.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  role rbac.app_role not null default 'user',
  invited_by uuid not null references identity.profiles(id),
  tenant_id uuid references core.tenants(id),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  created_at timestamptz default now()
);
```

- Index on `email` for lookup
- Index on `token` for redemption
- RLS: only `grand_master` can insert/select

## 3. API Routes

**Endpoints:**
- `POST /api/admin/invite` — create invitation, send email
- `GET /api/admin/users` — list users with roles
- `PATCH /api/admin/users/:id/role` — update user role
- `DELETE /api/admin/invites/:id` — revoke invitation
- `POST /api/admin/invites/:token/redeem` — accept invitation

All routes require `rbac.authorize('users.manage')` or `rbac.is_grand_master()`.

## 4. RLS Policies

Add policies for grand_master access:

```sql
-- Grand master can read all user roles
create policy grand_master_read_user_roles on rbac.user_roles
for select to authenticated using (rbac.is_grand_master());

-- Grand master can manage all user roles
create policy grand_master_manage_user_roles on rbac.user_roles
for all to authenticated using (rbac.is_grand_master())
with check (rbac.is_grand_master());
```

Similar for `admin.invitations` table.

## 5. Permissions

Add grand_master-specific permissions to `rbac.role_permissions`:

```sql
insert into rbac.role_permissions (role, permission) values
  ('grand_master', 'users.manage'),
  ('grand_master', 'audit.read'),
  ('grand_master', 'admin.invite'),
  ('grand_master', 'admin.manage_roles')
on conflict (role, permission) do nothing;
```

Add `admin.invite` and `admin.manage_roles` to `rbac.app_permission` enum in `00_foundation.sql`.
