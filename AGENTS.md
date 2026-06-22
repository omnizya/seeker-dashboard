# AGENTS.md

## Quick commands

```bash
bun install              # install deps (bun only — NOT npm/yarn/pnpm)
bun run dev              # dev server at localhost:3000
bun run build            # production build (uses --webpack flag)
bun run lint             # eslint (flat config, next/core-web-vitals)
bun run check:unused     # next-unused — FAILS if unused files exist
bun run parse:csv        # run CSV parser for holy_names data
bun run parse:txt        # run Quran text parser
```

No test suite, no CI, no pre-commit hooks. `bun run lint` is the only automated verification.

Server-side `track()` calls (`@vercel/analytics/server`) need `NEXT_PUBLIC_VERCEL_ENV` set locally or they throw. Only affects auth actions (`login`, `signup`).

---

## Project identity

Arabic-first (RTL) Islamic/spiritual platform called **"الباحث"** (seeker). All UI strings in Arabic.

---

## Stack (verified against source — not package.json)

| Layer | What | Details |
|---|---|---|
| **Framework** | Next.js **16.2.9** (NOT 14) | App Router (`src/app/`) |
| **UI** | shadcn/ui + Radix UI + Tailwind v3 | **NOT Chakra** — Chakra was fully removed in commit cbbb6a4 |
| **CSS** | Tailwind CSS v3 + daisyUI (`themes: false`) + CSS variables | Hover: dark: variants need manual handling |
| **Component lib** | `~/components/ui/` — 17 shadcn/ui components | button (CVA), card, dialog, dropdown-menu, sheet, tabs, select, etc. |
| **Dark mode** | `next-themes` with `class` strategy | DaisyUI themes are disabled; dark mode uses CSS variables |
| **Icons** | `lucide-react` (primary), `react-icons` (secondary) | |
| **Toast** | `sonner` | Via `~/components/ui/sonner.tsx` |
| **Auth** | Supabase (`@supabase/ssr` + `@supabase/auth-helpers-nextjs`) | Mixed clients — see Auth section |
| **Data fetching** | `useEffect` + `fetch()` + `AbortController` | **NOT** SWR (SWR is in deps but never imported) |
| **i18n** | Manual `DefaultText` object from `~/texts` | **NOT** next-intl hooks (next-intl installed but unused in components) |
| **Analytics** | Vercel Analytics + Speed Insights | See Providers section |
| **Toast** | `sonner` | Radix Dialog + Input for bookmark creation |

### CSS variable theme

`src/app/globals.css` has the shadcn/ui HSL variable set (light + dark). `src/styles/globals.css` is an **orphaned legacy file** — it imports Google Fonts (Inter) and has a Uthman @font-face, but neither is actually used since the active setup is in `globals.css` + `fonts.tsx`. **Do not import `src/styles/globals.css`.**

### Fonts

Two redundant sources (both load `UthmanicHafs1Ver18.woff2` from quran.com CDN):
1. `src/app/globals.css` — `@font-face` in `@layer base`
2. `src/styles/fonts.tsx` — inline `<style>` injection (rendered in `<Providers>`, so it runs)

**Don't add a third.** Prefer the CSS approach.

---

## Path alias

```ts
// ~/ maps to src/ — always use it
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
```

No `@/` alias exists.

---

## Routing

```
src/app/
  page.tsx                  # Landing page (Quran verse hero, CTA buttons)
  learn/page.tsx            # Learn more section
  error.tsx                 # Error boundary (basic "Try again")
  404.tsx                   # Custom 404
  500.tsx                   # Custom 500
  auth/
    actions.ts              # Server actions: login(), signup()
    confirm/route.ts        # Email OTP verification callback
    login/page.tsx          # Login form (wired to login server action)
    register/page.tsx       # Registration form (wired to signup server action)
    verify-email/page.tsx   # 4-digit OTP UI shell — NOT wired
    request-reset/page.tsx  # "Forgot password" UI shell — NOT wired
    reset-password/page.tsx # New password UI shell — NOT wired
  dashboard/
    layout.tsx              # force-dynamic + SidebarWithHeader wrapper
    page.tsx                # Server component, auth guard → GeoDataCard + PlanetaryHoursCard + JummalCard
    astro/page.tsx          # Sun, moon, qibla (useGeolocation + /api/astro)
    bookmarks/page.tsx      # Quran verse bookmarks (auth req)
    dua/page.tsx            # Categorized dua lists
    holy-names/page.tsx     # 99 Names table (direct Supabase query)
    jadwal/page.tsx         # "قيد التطوير" stub
    journal/page.tsx        # Spiritual journal CRUD (auth req)
    prayer/page.tsx         # Prayer times (geolocation + /api/prayer)
    profile/page.tsx        # UI shell — NOT wired to save
    quran/page.tsx          # Ayah list (NDJSON stream via /api/quran)
    quran/[id]/page.tsx     # Single ayah + bookmarks (auth req for bookmarks)
    tasbih/page.tsx         # Dhikr counter with presets (auth req)
```

**Missing routes**: No `loading.tsx`, no `not-found.tsx` anywhere. The sidebar links to 10 pages (see `DefaultText.dashboard.navbar.links`) but only `/dashboard` has content — `/squares` nav link is dead (no route exists).

---

## Auth

### Mixed client libraries (legacy)

| File | Package | Pattern |
|---|---|---|
| `src/utils/supabase/client.ts` | `@supabase/ssr` | `createBrowserClient()` |
| `src/utils/supabase/server.ts` | `@supabase/ssr` | `createServerClient()` with `cookies()` |
| `src/utils/supabase/middleware.ts` | `@supabase/ssr` | `updateSession()` helper (NOT wired as middleware — see below) |
| `src/components/HolyNames.tsx` | `@supabase/auth-helpers-nextjs` | `createClientComponentClient()` — the only file still using the old package |

### NO functional middleware

**There is no root `middleware.ts` or `src/middleware.ts`.** The file `proxy.ts` exists at root with `config.matcher` + `next-intl/middleware` but is **NOT named `middleware.ts`** so Next.js ignores it. This means:
- Auth sessions are NOT refreshed on route transitions
- No locale detection/redirect runs
- The only auth guard is the server-side check in `dashboard/page.tsx`

### Auth flow

1. Register → `signup()` server action → Supabase auth → redirect `/`
2. Login → `login()` server action → Supabase auth → redirect `/dashboard`
3. Email confirm → `/auth/confirm` handles `token_hash` from email link
4. Auth-required API routes return 401 if `getUser()` fails

**Env vars required** (both `NEXT_PUBLIC_`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## Supabase local dev

```
supabase/config.toml  — fully configured
```

Ports:
- API: 54321
- DB: 54322 (shadow: 54320)
- Studio: 54323
- Inbucket (email testing): 54324

**No migrations directory** (`supabase/migrations/` absent). Schema is applied manually via `sql/` files — see Database.

---

## Database

| Source | Status | Content |
|---|---|---|
| `sql/` directory (12 files + run_all.sql) | **Active** | Modular schema: `00_foundation.sql` → `10_features.sql`. Extensions, schemas (core, identity, rbac, spiritual, magick, audit, prayer, planetary, astro features), enums, tables. Apply via `run_all.sql`. |
| `seeker.sql` (root) | Legacy | Earlier schema: RBAC enums, `holy_names`, `abjad`, `user_roles`, `role_permissions`. May overlap with `sql/` files. |
| `src/types/supabase.ts` | **Incomplete** | Only `public.holy_names` typed. `spiritual.*` tables (`quran_bookmarks`, `spiritual_journal`, `dua_lists`, `dua_entries`, `tasbih_presets`, `tasbih_sessions`) are **untyped** (`never`). |

**No ORM** (no Prisma, Drizzle, TypeORM). Raw SQL via Supabase.

---

## API routes

18 route files in `src/app/api/`. Key behaviour:

| Auth required | Routes |
|---|---|
| **Yes** (401 if no user) | `/api/bookmarks`, `/api/journal`, `/api/tasbih` |
| **No** (public) | `/api/jummal`, `/api/magick-squares`, `/api/planetary-hours`, `/api/prayer`, `/api/quran`, `/api/astro`, `/api/sunrise`, `/api/dua` |

**Data sources**:
- **Pure TS computation** (no external API): prayer times, astro (sun/moon/qibla), jummal, magick squares, planetary hours
- **External API**: sunrise/sunset (`api.sunrise-sunset.org`), geocoding (Nominatim/OSM)
- **Static compressed file**: Quran ayah data (`src/data/ayats/data.jsonl.gz` — gzipped NDJSON, streamed via `/api/quran`)
- **Supabase DB**: bookmarks, journal, du'as, tasbih, holy names

**Gotcha**: `/api/quran/[id].ts` is a legacy Pages Router file alongside the App Router `route.ts`. Submit to both.

---

## UI patterns

### Data fetching in client components

```tsx
// Standard pattern (NOT SWR — SWR is never used)
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/...`, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => setError(e.message));
  return () => controller.abort();
}, [deps]);
```

Four state categories used consistently: `loading` / `error` / `no data` / render.

### Form handling

No form libraries (no react-hook-form, Formik, etc.):
- **Server action forms**: `<form>` with `<Button formAction={serverAction}>` — inputs read via `formData.get("name")`
- **Controlled forms**: `useState` + `onChange` for dialogs (e.g., bookmark creation)
- **Validation**: HTML `required` attribute only — no Zod, yup, or custom validation

### Class merging

```ts
import { cn } from "~/lib/utils";  // clsx + tailwind-merge
<button className={cn("base-class", condition && "conditional-class")} />
```

### Component structure

- shadcn/ui primitives in `~/components/ui/{component}.tsx`
- App components in `~/components/{Component}.tsx` or `~/components/{ComponentName}/index.tsx`
- CVA (class-variance-authority) for variant props (see `button.tsx`)

### Dark mode

Tailwind `dark:` variant + `.dark` class on `<html>`. Toggled via `next-themes` `ThemeProvider`. Requires both:
- `@layer base { .dark { --var: value; } }` in CSS
- Tailwind `dark:` prefix for conditional classes

---

## Client components

The project is heavily client-side. 44 files have `"use client"`. All pages, dashboard sub-pages, and complex components are client components. Server components are the exception:
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/jadwal/page.tsx`
- `src/app/404.tsx`, `500.tsx`
- API routes (naturally)

The landing page (`/`) is a client component despite being static — could be refactored.

---

## Gotchas

- **Server actions** locked to `localhost:3000` only (`next.config.mjs`). Will fail in production or on other domains.
- **`bun run build`** passes `--webpack` flag (overrides Turbopack). No custom webpack config found — verify this is intentional.
- **Two nav systems coexist**: `SidebarWithHeader` (English hardcoded labels, active in layout) vs `Navbar.tsx` (Arabic from `DefaultText`, unused). The sidebar renders its own nav links, not the Navbar component.
- **Two footers**: `Footer/index.tsx` (full, unused) vs `Footer/appFooter.tsx` (mini, used on landing).
- **`next-intl`** is installed and `proxy.ts` configures its middleware, but no component actually imports from it. All i18n is the `DefaultText` pattern. If you add `useTranslations`, you'll need to create `messages/` directory and wire the loader.
- **`.vscode/settings.json`** has Deno configured for `supabase/functions` but globally disabled. Edge functions directory doesn't exist yet.
- **`.gitignore`** blocks `*.env.local` but NOT `.env` at root level. `supabase/.gitignore` correctly blocks `.env`.
- **`eslint-config-next`** with `next/core-web-vitals` — keep clean.
- **`next-unused`** (`check:unused`) will error on any unused file — remove dead code.
- **No `.env.example`** exists. Both required vars are `NEXT_PUBLIC_SUPABASE_*`.
- **No CI/CD** — no `.github/` directory. Lint and unused-checks are local-only.
- **Monorepo markers**: `.npmrc` hoists `@nextui-org/*` (legacy, not in deps). Root `components.json` points shadcn/ui to `~/components/ui`. No workspace config.
- **`next.config.mjs`** still has `optimizePackageImports` and `transpilePackages` for Chakra/Emotion even though those packages are fully removed. Leftover config — clean it up.
