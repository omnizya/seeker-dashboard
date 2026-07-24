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
| **Auth** | Token-based via backend API | Zustand `authStore` + `~/lib/api.ts` — NO Supabase client libs |
| **State** | Zustand stores in `~/stores/` | `authStore`, `bookmarkStore`, `duaStore`, `journalStore`, `tasbihStore` |
| **Validation** | Zod schemas in `~/schemas/` | `auth`, `bookmark`, `dua`, `journal`, `tasbih` — used by stores |
| **Data fetching** | SWR (`useSWR` + `~/lib/fetcher`) | Used in 11 files for API data. Also `useEffect` + `fetch()` + `AbortController` in some pages |
| **API client** | `~/lib/api.ts` — centralized HTTP with JWT refresh | Auto-retry on 401, token refresh, auto-redirect to `/auth/login` |
| **i18n** | Manual `DefaultText` object from `~/texts` | **NOT** next-intl hooks (next-intl installed but unused in components) |
| **Analytics** | Vercel Analytics + Speed Insights | See Providers section |

### CSS variable theme

`src/app/globals.css` has the shadcn/ui HSL variable set (light + dark).

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

**Missing routes**: No `loading.tsx`, no `not-found.tsx` anywhere.

---

## Auth

### Auth flow

Auth is token-based via a backend API (`NEXT_PUBLIC_API_URL`, defaults to `http://localhost:3001`). No Supabase client libraries are used in app code.

1. Login → `authStore.login()` → `POST /api/auth/login` → stores tokens in localStorage
2. Register → `authStore.register()` → `POST /api/auth/register`
3. Session check → `authStore.initAuth()` → `GET /api/auth/me` with stored token
4. API client auto-refreshes on 401 via `tryRefresh()`, redirects to `/auth/login` on failure

### Token management

`~/lib/api.ts` manages tokens via localStorage:
- `setTokens(accessToken, refreshToken)` — stores after login
- `loadTokens()` — loads from localStorage
- `getAccessToken()` — returns current access token
- `clearTokens()` — removes from localStorage (on logout or auth failure)

**Env vars required** (all `NEXT_PUBLIC_`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=           # optional, defaults to http://localhost:3001
```

See `.env.example` for a template.

---

## Zustand stores + Zod schemas

Stores in `~/stores/` pair with Zod schemas in `~/schemas/`:

| Store | Schema | Purpose |
|---|---|---|
| `authStore` | `auth.ts` | Login/register with JWT token management |
| `bookmarkStore` | `bookmark.ts` | Quran verse bookmarks |
| `duaStore` | `dua.ts` | Dua lists and entries |
| `journalStore` | `journal.ts` | Spiritual journal CRUD |
| `tasbihStore` | `tasbih.ts` | Dhikr counter presets |

Pattern: stores use `safeParse()` from Zod before API calls. Validation errors from Zod are surfaced as store `error` state. Both are re-exported from `~/stores/index.ts` and `~/schemas/index.ts`.

### API client

`~/lib/api.ts` provides a centralized HTTP client:
- `api.get/post/put/delete<T>(path, body?, options?)` — typed fetch wrapper
- Auto-retry on 401 with token refresh (`tryRefresh()`)
- Redirects to `/auth/login` on auth failure
- Token management via `setTokens()`, `clearTokens()`, `loadTokens()`
- `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:3001`)

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

SWR is the primary data-fetching pattern (used in 11 files):

```tsx
import useSWR from "swr";
import { swrFetcher } from "~/lib/fetcher";

const { data, error, isLoading } = useSWR<T>("/api/endpoint", swrFetcher);
```

Some pages still use the manual `useEffect` + `fetch()` + `AbortController` pattern — prefer SWR for new code.

### Form handling

No form libraries (no react-hook-form, Formik, etc.):
- **Server action forms**: `<form>` with `<Button formAction={serverAction}>` — inputs read via `formData.get("name")`
- **Controlled forms**: `useState` + `onChange` for dialogs (e.g., bookmark creation)
- **Zod validation**: stores use `safeParse()` from Zod schemas before API calls — not raw HTML validation

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
- **`next-intl`** is installed but no component imports from it. All i18n is the `DefaultText` pattern. If you add `useTranslations`, you'll need to create `messages/` directory and wire the loader.
- **`.vscode/settings.json`** has Deno configured for `supabase/functions` but globally disabled. Edge functions directory doesn't exist yet.
- **`eslint-config-next`** with `next/core-web-vitals` — keep clean.
- **`next-unused`** (`check:unused`) will error on any unused file — remove dead code.
- **No CI/CD** — no `.github/` directory. Lint and unused-checks are local-only.
- **DaisyUI v5** is installed but `themes: false` in config — it only provides utility classes, not theme switching.
