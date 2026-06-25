# Seeker Dashboard Refactor: Consume seeker-api

## [S1] Problem

seeker-dashboard currently has 20 API route files in `src/app/api/` that compute locally or query Supabase directly. All 35 `fetch()` calls use relative URLs (`/api/...`). The same logic now exists in seeker-api (55 migrated endpoints). Dashboard needs to be refactored to consume seeker-api instead of running its own API layer.

## [S2] Architecture Overview

**Current state:** seeker-dashboard has 20 API routes in `src/app/api/` that compute locally or query Supabase directly. 35 `fetch()` calls in stores/pages/components hit these local routes.

**Target state:** All API routes removed. Dashboard communicates with seeker-api (separate service) via a centralized API client. SWR handles data fetching with caching/revalidation.

**Key decisions:**
- `NEXT_PUBLIC_API_URL` env var (default `http://localhost:3001`) points to seeker-api
- All `src/app/api/` deleted (including dead Pages Router files)
- Supabase SDK deps (`@supabase/ssr`, `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`) removed
- SWR replaces useEffect+fetch+useState pattern

## [S3] API Client Design

A single `src/lib/api.ts` module:

- Base URL from `NEXT_PUBLIC_API_URL` env var
- Auth token getter: reads from authStore (Zustand) or localStorage
- Generic request helper: GET/POST/PUT/DELETE with JSON parsing, error normalization
- Auth token auto-injected in Authorization header
- 401 → clear auth state, redirect to login

**Stores become thin wrappers:** Each Zustand store (bookmarkStore, duaStore, journalStore, tasbihStore) calls `api.get()`, `api.post()`, etc. instead of raw `fetch()`.

**SWR usage in pages/components:** Replace `useEffect + fetch + useState` with `useSWR(key, fetcher)` where the fetcher calls `api.get(url)`. SWR handles caching, revalidation, loading/error states.

## [S4] Auth Flow

**Login flow:**
1. `authStore.login(email, password)` → `POST ${API_URL}/api/auth/login`
2. Response: `{ accessToken, refreshToken, user }`
3. Store tokens in Zustand state + localStorage for persistence
4. All subsequent API calls include `Authorization: Bearer <accessToken>`

**Token refresh:** On 401 response, attempt refresh via `POST /api/auth/refresh` with refresh token. If refresh fails, clear auth state and redirect to `/login`.

**Registration:** `POST /api/auth/register` on seeker-api.

**Current Supabase SSR middleware** (`src/utils/supabase/middleware.ts`) — deleted. No cookie-based auth.

**Dashboard auth guard** (`src/app/dashboard/page.tsx` async Server Component) — needs rework. Currently uses Supabase server client. Will check Zustand auth state instead (client-side redirect).

## [S5] Route Migration Mapping

Dashboard route → seeker-api endpoint:

| Dashboard Route | seeker-api Endpoint | Notes |
|---|---|---|
| `POST /api/auth/login` | `POST /api/auth/login` | Direct match |
| `GET /api/prayer` | `GET /api/prayer` | Direct match |
| `GET /api/astro` | `GET /api/astro` | Direct match |
| `GET /api/magick-squares` | `GET /api/magick-squares` | Direct match |
| `GET /api/planetary-hours` | `GET /api/planetary-hours` | Direct match |
| `GET /api/sunrise` | `GET /api/sunrise` | Direct match |
| `GET /api/sunrise/[location]` | `GET /api/sunrise/{location}` | Direct match |
| `GET /api/jummal` | `GET /api/jummal` | Direct match |
| `GET /api/jummal/[text]` | `GET /api/jummal/{text}` | Direct match |
| `GET/POST /api/quran` | `GET /api/quran` | Direct match |
| `GET /api/quran/[id]` | `GET /api/quran/{id}` | Direct match |
| `GET/POST /api/bookmarks` | `GET/POST/DELETE /api/bookmarks` | seeker-api also has DELETE |
| `GET/POST/PUT/DELETE /api/journal` | `GET/POST/PUT/DELETE /api/journal` | Direct match |
| `GET/POST /api/tasbih` | `GET/POST /api/tasbih` | Direct match |
| `GET/POST /api/dua` | `GET/POST /api/dua` | Direct match |
| `GET/POST /api/lodge` | `POST /api/lodge/compute` + `POST /api/lodge/validate` | seeker-api splits lodge into compute/validate |

**Lodge** needs special attention: dashboard's lodge engine (`src/engine/`) becomes stateless API calls. The `POST /api/lodge` route will be replaced by two separate calls.

## [S6] Cleanup

**Files to delete:**
- `src/app/api/` — entire directory (20 files)
- `src/utils/supabase/` — all 3 files (server.ts, client.ts, middleware.ts)
- `src/utils/sunrise.ts` — server-side external fetch (now in seeker-api)
- Dead Pages Router files: `src/app/api/hello.ts`, `src/app/api/quran/[id].ts`

**Dependencies to remove from package.json:**
- `@supabase/ssr`
- `@supabase/supabase-js`
- `@supabase/auth-helpers-nextjs`
- `cookie`

**Dependencies to keep:**
- `swr` (now actively used)
- `zod` (validation in stores)
- `zustand` (state management)

**Environment changes:**
- Add `NEXT_PUBLIC_API_URL=http://localhost:3001` to `.env.local`
- Remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Files to update:**
- 5 Zustand stores → use centralized API client
- ~10 pages/components → use SWR hooks
- `HolyNames.tsx` → use seeker-api `/api/holy-names` instead of direct Supabase query
