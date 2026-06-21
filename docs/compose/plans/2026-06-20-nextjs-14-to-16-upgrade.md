# Next.js 14 → 16 Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Next.js from 14.1.4 to 16.x with all necessary codemods and dependency updates.

**Architecture:** Use the official `@next/codemod upgrade` command to handle the bulk of the upgrade, then manually fix any remaining issues. The upgrade will update Next.js, React, and React DOM, and run applicable codemods automatically.

**Tech Stack:** Next.js 14.1.4 → 16.x, React 18 → 19, Supabase SSR, Chakra UI, next-intl, next-themes

---

### Task 1: Run the Upgrade Codemod

**Covers:** Core upgrade process

**Files:**
- Modify: `package.json` (version updates)
- Modify: `bun.lock` (lockfile update)
- Potential: `src/utils/supabase/middleware.ts` (async API changes)
- Potential: `middleware.ts` (proxy migration)

- [ ] **Step 1: Run the upgrade command**

```bash
npx @next/codemod upgrade
```

This will:
- Detect current version (14.1.4)
- Update to latest stable version
- Update React and React DOM
- Run applicable codemods (async APIs, image imports, etc.)

Expected: Interactive prompts asking which codemods to apply. Select all recommended ones.

- [ ] **Step 2: Verify package.json changes**

Run: `cat package.json | grep -E '"(next|react|react-dom)"'`
Expected: Versions updated to 16.x and React 19

- [ ] **Step 3: Run bun install to update lockfile**

```bash
bun install
```

Expected: Successful lockfile update

- [ ] **Step 4: Run build to check for errors**

```bash
bun run build
```

Expected: Build succeeds or shows specific errors to fix

---

### Task 2: Fix Async API Changes (if needed)

**Covers:** Next.js 15 breaking change - async dynamic APIs

**Files:**
- Modify: `src/utils/supabase/middleware.ts` (cookies() now async)
- Modify: `src/utils/supabase/server.ts` (cookies() now async)
- Modify: `src/app/auth/actions.ts` (if using cookies/headers)

- [ ] **Step 1: Check if codemod applied async transforms**

```bash
grep -r "await cookies()" src/
grep -r "UnsafeUnwrapped" src/
```

Expected: If codemod ran, these patterns exist. If not, manual fix needed.

- [ ] **Step 2: Fix middleware.ts (if not auto-fixed)**

Current code uses `cookies()` synchronously. In Next.js 15+, `cookies()` returns a Promise.

```typescript
// src/utils/supabase/middleware.ts
// Change from:
const cookieStore = cookies()
// To:
const cookieStore = await cookies()
```

- [ ] **Step 3: Fix server.ts (if not auto-fixed)**

Same async change needed:

```typescript
// src/utils/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies()
  // ... rest of function
}
```

- [ ] **Step 4: Run build to verify**

```bash
bun run build
```

Expected: No type errors from async API changes

---

### Task 3: Migrate Middleware to Proxy (Next.js 16)

**Covers:** Next.js 16 breaking change - middleware deprecated for proxy

**Files:**
- Create: `src/proxy.ts` (renamed from middleware.ts)
- Delete: `middleware.ts`
- Modify: `next.config.mjs` (if needed)

- [ ] **Step 1: Run the middleware-to-proxy codemod**

```bash
npx @next/codemod@latest middleware-to-proxy .
```

Expected: `middleware.ts` renamed to `proxy.ts`, exports renamed

- [ ] **Step 2: Verify the migration**

```bash
cat src/proxy.ts 2>/dev/null || cat proxy.ts
```

Expected: File exists with `proxy` export instead of `middleware`

- [ ] **Step 3: Update middleware import path (if needed)**

Check if `src/utils/supabase/middleware.ts` is still imported correctly:

```bash
grep -r "supabase/middleware" src/
```

Expected: Import paths updated or still valid

- [ ] **Step 4: Run build to verify**

```bash
bun run build
```

Expected: Build succeeds with new proxy convention

---

### Task 4: Migrate ESLint Config (Next.js 16)

**Covers:** Next.js 16 - migrate from `next lint` to ESLint CLI

**Files:**
- Create: `eslint.config.mjs` (new flat config)
- Modify: `package.json` (lint script)
- Delete: `.eslintrc.json` (old config)

- [ ] **Step 1: Run the lint migration codemod**

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

Expected: Creates `eslint.config.mjs`, updates package.json scripts

- [ ] **Step 2: Verify new lint script**

```bash
cat package.json | grep '"lint"'
```

Expected: `"lint": "eslint ."` instead of `"lint": "next lint"`

- [ ] **Step 3: Install any new ESLint dependencies**

```bash
bun install
```

Expected: New eslint dependencies added

- [ ] **Step 4: Run lint to verify**

```bash
bun run lint
```

Expected: Lint runs successfully with new config

- [ ] **Step 5: Remove old ESLint config**

```bash
rm .eslintrc.json
```

---

### Task 5: Verify Chakra UI Compatibility

**Covers:** Ensure Chakra UI works with React 19

**Files:**
- No changes expected, but verify runtime behavior

- [ ] **Step 1: Check Chakra UI version compatibility**

```bash
cat package.json | grep chakra
```

Expected: Chakra UI v2.x should work with React 19, but check for warnings

- [ ] **Step 2: Run dev server and test UI**

```bash
bun dev
```

Then open http://localhost:3000 and verify:
- Landing page renders
- Navigation works
- Dashboard loads (after login)

- [ ] **Step 3: Check for React 19 warnings in console**

Expected: No "Invalid hook call" or compatibility warnings

---

### Task 6: Verify Supabase Auth Flow

**Covers:** Ensure auth still works with async cookies

**Files:**
- Verify: `src/utils/supabase/server.ts`
- Verify: `src/utils/supabase/middleware.ts`
- Verify: `src/utils/supabase/client.ts`

- [ ] **Step 1: Test login flow**

1. Start dev server: `bun dev`
2. Navigate to `/auth/login`
3. Enter credentials
4. Verify redirect to `/dashboard`

Expected: Login succeeds, session cookies set correctly

- [ ] **Step 2: Test protected routes**

1. Access `/dashboard` without login
2. Verify redirect to `/auth/login`

Expected: Proper auth guard behavior

- [ ] **Step 3: Test session refresh**

1. Login and wait 5+ minutes
2. Navigate to different pages
3. Verify session persists

Expected: No unexpected logouts

---

### Task 7: Final Verification and Cleanup

**Covers:** Ensure everything works end-to-end

**Files:**
- No changes expected

- [ ] **Step 1: Run full build**

```bash
bun run build
```

Expected: Clean build with no errors

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

Expected: No lint errors

- [ ] **Step 3: Run dev server and manual test**

```bash
bun dev
```

Test all routes:
- `/` (landing page)
- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/dashboard/quran`
- `/dashboard/holy-names`
- `/learn`

Expected: All pages load and function correctly

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "chore: upgrade Next.js 14.1.4 → 16.x with codemods"
```

Expected: Clean commit with all upgrade changes

---

## Notes

- The upgrade process may prompt for additional codemod selections - accept all recommended ones
- If `next-themes` has compatibility issues, it may need a version bump
- `next-intl` should be compatible but test locale switching
- Chakra UI v2 works with React 19 but check for any deprecation warnings
