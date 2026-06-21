# AGENTS.md

## Quick commands

```bash
bun install          # install dependencies (bun, not npm/yarn)
bun run dev          # start dev server on localhost:3000
bun run build        # production build
bun run lint         # eslint (next/core-web-vitals) — run before commits
bun run check:unused # fails if unused files exist
```

No test suite exists. `bun run lint` is the only automated verification.

## Project identity

Arabic-first (RTL) Islamic/spiritual platform called "الباحث" (seeker). All UI strings in `src/texts/index.ts` are Arabic. Default locale is `"ar"` via `next-intl`.

## Path alias

`~/` maps to `src/` — always use it:
```ts
import { siteConfig } from "~/config/site";
```

## Stack

- **Next.js 14** App Router (`src/app/`)
- **Chakra UI v2** — theme in `src/styles/theme.ts`, fonts in `src/styles/fonts.tsx`
- **Supabase** — auth + database; helpers in `src/utils/supabase/`
- **next-intl** — i18n with locales `["en", "ar"]`, default `"ar"`
- **SWR** — client data fetching
- **Tailwind CSS** — PostCSS configured but Chakra UI is the primary styling approach
- **Vercel** — deployed with Analytics + Speed Insights

## Routing

```
src/app/
  page.tsx          # landing page (hero with Quran verse)
  learn/page.tsx    # learn more section
  auth/             # login, register, confirm, verify-email, reset-password
  dashboard/
    page.tsx        # jummal calculator (main dashboard)
    quran/          # Quran tools
    holy-names/     # Asma al-Husna
    jadwal/         # schedule
    profile/        # user profile
  api/              # API routes: jummal, quran, sunrise
```

## Auth

Supabase auth via `@supabase/auth-helpers-nextjs` + `@supabase/ssr`. Session updated in `middleware.ts` on every request. Client-side helpers in `src/utils/supabase/client.ts`, server-side in `src/utils/supabase/server.ts`.

## Supabase local dev

`supabase/config.toml` is fully configured. Key ports:
- API: 54321
- DB: 54322 (shadow: 54320)
- Studio: 54323
- Inbucket (email testing): 54324

## RTL / Arabic

- `<html lang="ar" dir="rtl">` is set in `src/app/layout.tsx`
- All new components must work in RTL layout
- Text content comes from `src/texts/index.ts` (`DefaultText` object)

## Gotchas

- Server actions enabled but restricted to `localhost:3000` origin (`next.config.mjs`)
- `.vscode/settings.json` has Deno configured for `supabase/functions` but it's currently disabled
- No CI/CD workflows in `.github/` — lint is local-only
- `eslint-config-next` with `next/core-web-vitals` — keep it clean
- `next-unused` (`check:unused`) will error on unused files — remove dead code
