---
name: sql-modularize
description: Consolidate redundant SQL files into a single schema, then split by domain with correct dependency ordering. For Postgres/Supabase projects.
---

# SQL Modularize

Transform a messy `sql/` directory (multiple redundant files, unclear order) into a clean, domain-separated schema with a single orchestrator.

## When to use

- User says "modularize SQL", "split schema by domain", "clean up sql files"
- Multiple `.sql` files in `sql/` with overlapping or unclear content
- Need to understand cross-domain dependencies before reorganizing

## Workflow

### Step 1 — Read all existing SQL files

```
Read the sql/ directory listing
Read every .sql file in full
```

Catalog each file's contents: which schemas, tables, functions, triggers, views, RLS policies it defines. Note which files are redundant (same content, older versions, empty stubs).

### Step 2 — Map cross-domain dependencies

Identify which domains reference each other:

| Pattern | Example |
|---------|---------|
| Function called by another domain's trigger | `audit.log_change()` used by spiritual + magick triggers |
| Function used in RLS policies | `core.current_tenant()`, `rbac.authorize()` in every RLS policy |
| Shared utility function | `spiritual.inject_tenant()` reused by magick domain |
| Enum values referenced later | `rbac.app_permission` values used in RLS policies |

Write the dependency graph. This determines the `run_all.sql` execution order.

### Step 3 — Create domain files

Each domain file is **self-contained**: tables, indexes, functions, triggers, views, and RLS policies for that domain.

**File naming convention:** `NN_name.sql` where `NN` is a zero-padded order that groups logically (not strictly topologically — `run_all.sql` handles real ordering).

**Standard structure per file:**

```sql
-- ================================================================
-- DOMAIN NAME: what it owns
-- Depends on: list prerequisite files
-- Also uses: cross-domain functions it calls
-- ================================================================

-- ---- tables ---------------------------------------------------
-- ---- indexes --------------------------------------------------
-- ---- functions ------------------------------------------------
-- ---- triggers -------------------------------------------------
-- ---- API views ------------------------------------------------
-- ---- RLS ------------------------------------------------------
```

**Dependency-ordered domains (Postgres/Supabase pattern):**

| Order | Domain | Contents |
|-------|--------|----------|
| 00 | foundation | Extensions, schemas, enums, shared internal helpers |
| 01 | identity | User profiles, auth hooks |
| 02 | core | Tenancy (tenants, memberships), tenant context functions |
| 03 | rbac | Roles, permissions, authorize function |
| 04 | audit | Event logging table, log_change trigger function |
| 05+ | business domains | Domain-specific tables, functions, triggers, views |
| 99 | run_all | `\i` orchestrator with correct order |

**Key rules:**
- Enums that are referenced later must be defined in foundation (not via separate `ALTER TYPE ADD VALUE` at the end)
- Audit must load before business domains (triggers reference `audit.log_change()`)
- Each file documents cross-domain dependencies in its header comment
- Use `create or replace` for functions, `drop trigger if exists` before `create trigger`

### Step 4 — Create run_all.sql

```sql
-- ================================================================
-- RUN ALL — execute in order via \i or psql
-- ================================================================
-- Usage: psql -d your_db -f sql/run_all.sql
-- ================================================================

\echo '--- 00_foundation ---'
\i sql/00_foundation.sql
\echo '--- 01_identity ---'
\i sql/01_identity.sql
-- ... etc in dependency order
```

Execution order must satisfy: every function/trigger referenced by file N is defined in files 0..N-1.

### Step 5 — Clean up

Delete redundant files that were consolidated. Verify with `ls sql/`.

## Optimization checklist

After modularization, check for:

- **Memoisation**: Repeated deterministic calculations → lookup table (e.g., `magick.element_config` replacing CASE functions)
- **Composite indexes**: RLS policies that call functions per-row → composite index on the filtered columns
- **Covering indexes**: API views joining on `id → display_name` → `INCLUDE (display_name)`
- **Partial indexes**: Hot recent data queries → `WHERE created_at > now() - interval '7 days'`

## Postgres gotchas

- `ALTER TYPE ... ADD VALUE` cannot be in the same transaction as code that references the new value (error 55P04). Define all enum values at `CREATE TYPE` time instead.
- `CREATE OR REPLACE FUNCTION` cannot reorder parameters. Use `DROP FUNCTION` + `CREATE FUNCTION` if signature changes.
- RLS policies that query the same table they protect cause infinite recursion. Use `SECURITY DEFINER` helper functions to break the cycle.
- `INSERT ... RETURNING` triggers the table's SELECT policy, not just INSERT. Pre-generate IDs to avoid this.
