# Feature Audit: Seeker Dashboard (الباحث)

Date: 2026-06-22 (Updated)
Scope: Full-stack gap analysis — frontend pages, API routes, SQL schemas, and missing features.

---

## 1. Current Feature Inventory

### 1.1 Frontend Pages

| Route | Status | Notes |
|---|---|---|
| `/` (landing) | ✅ | Hero with Quran verse, CTA buttons |
| `/learn` | ⚠️ Stub | "Work in Progress" |
| `/auth/*` (login, register, confirm, verify-email, reset-password) | ✅ | Full Supabase auth flow |
| `/dashboard` | ✅ | Jummal calculator, GeoDataCard, PlanetaryHoursCard |
| `/dashboard/quran` | ✅ | Streaming ayah browser (NDJSON) with jummal values |
| `/dashboard/quran/[id]` | ✅ | Individual ayah viewer — Arabic text, jummal values, **bookmark add/delete with label + color** |
| `/dashboard/holy-names` | ✅ | Asma al-Husna table from Supabase |
| `/dashboard/jadwal` | ⚠️ Stub | Says "قيد التطوير" |
| `/dashboard/squares` | ❌ **Missing** | Referenced in navbar as "الأوفاق" — **no route exists** |
| `/dashboard/prayer` | ✅ | Prayer times with geolocation, method selector, current prayer highlight, Hijri date |
| `/dashboard/astro` | ✅ | Qibla compass, moon phase, sun data with geolocation |
| `/dashboard/tasbih` | ✅ | Interactive dhikr counter — 7 presets, keyboard shortcuts, confetti, daily total from DB |
| `/dashboard/bookmarks` | ✅ | CRUD Quran bookmark manager — colors, labels, search, surah filter, **links to `/dashboard/quran/[id]`** |
| `/dashboard/journal` | ✅ | Spiritual journal — CRUD, types, moods, tags, private toggle, edit/delete |
| `/dashboard/dua` | ✅ | Category-filtered duas viewer — accordion entries with transliteration/translation/benefit |
| `/dashboard/profile` | ⚠️ Static | English-only form, **no Supabase integration** (inputs don't save) |
| `/blog` | ❌ Missing | Referenced in site config |
| `/about` | ❌ Missing | Referenced in site config |

### 1.2 API Routes

| Route | Status | Notes |
|---|---|---|
| `GET /api` | ✅ | Health check |
| `GET /api/sunrise` | ✅ | `?lat=&lng=&date=` → sunrise-sunset API proxy |
| `GET /api/sunrise/[location]` | ✅ | Geocodes location → coordinates → sunrise data |
| `GET /api/planetary-hours` | ✅ | `?lat=&lng=&date=` or explicit sunrise/sunset params |
| `GET /api/magick-squares` | ✅ | `?elemental=&input=` → 3×3 square + magic constant |
| `GET /api/jummal/[text]` | ✅ | Abjad calculation |
| `GET /api/jummal` | ✅ | |
| `GET /api/quran` | ✅ | Streams all ayahs as NDJSON (gzip) |
| `GET /api/quran/[id]` | ✅ | Single ayah lookup |
| `GET /api/prayer` | ✅ | `?lat=&lng=&date=&method=` → prayer times using calculation methods |
| `GET /api/astro` | ✅ | `?lat=&lng=&date=` → sun, moon, qibla data |
| `GET/POST /api/tasbih` | ✅ | Tasbih presets + sessions with daily total |
| `GET/POST/DELETE /api/bookmarks` | ✅ | Quran bookmark CRUD with `?ayah_id=` and `?surah_id=` filters |
| `GET/POST/PUT/DELETE /api/journal` | ✅ | Spiritual journal CRUD with `?entry_type=` filter |
| `GET /api/dua` | ✅ | Duas lists + entries with `?category=` filter |

### 1.3 Utilities

| Util | Status | Notes |
|---|---|---|
| `utils/sunrise.ts` | ✅ | Sunrise-sunset API wrapper |
| `utils/planetary-hours.ts` | ✅ | Planetary hour calculation |
| `utils/jummal.ts` | ✅ | Abjad numeral calculation |
| `utils/magick-squares.ts` | ✅ | Wafq (magic square) generation |
| `utils/prayer-times.ts` | ✅ | Prayer time calculation with configurable methods (MWL, ISNA, Egypt, UmmAlQura, Karachi, Tehran, Jafari) |
| `utils/astro.ts` | ✅ | Sun position, moon phase, qibla bearing/distance |

### 1.4 SQL Schemas (Unapplied)

| Schema | Status | Tables/Views |
|---|---|---|
| `00_foundation.sql` | ⏳ Not applied | Extensions, schemas, enums, `magick.element_config` |
| `01_identity.sql` | ⏳ Not applied | `identity.profiles`, auto-create trigger, RLS |
| `02_core.sql` | ⏳ Not applied | `core.tenants`, multi-tenant RLS |
| `03_rbac.sql` | ⏳ Not applied | `rbac.user_roles`, `authorize()` function |
| `04_spiritual.sql` | ⏳ Not applied | `spiritual.holy_names`, `spiritual.abjad_calculations`, audit triggers |
| `05_magick.sql` | ⏳ Not applied | `magick.square_calculations`, `fill_square()`, `is_magic_square()` |
| `06_audit.sql` | ⏳ Not applied | `audit.events`, `log_change()` trigger |

> Note: The running Supabase instance already has tables under a `spiritual` schema (created via direct migrations outside these files): `tasbih_presets`, `tasbih_sessions`, `quran_bookmarks`, `spiritual_journal`, `dua_lists`, `dua_entries`. The existing `holy_names` table is separate from `04_spiritual.sql`.

---

## 2. Gap Analysis

### 2.1 Missing Pages / Broken Links

| Route | Priority | Notes |
|---|---|---|
| `/dashboard/squares` (الأوفاق) | **HIGH** | Referenced in navbar, **route doesn't exist**. `/api/magick-squares` ready, utility ready |
| `/dashboard/jadwal` | **MEDIUM** | Stub — "قيد التطوير". Could redirect to squares page |
| `/dashboard/profile` | **HIGH** | Form renders but doesn't save — no Supabase connection. English-only |
| `/learn` | **LOW** | Stub |
| `/blog`, `/about` | **LOW** | Referenced in config |

### 2.2 Missing Data / Empty States

| Feature | Issue |
|---|---|
| **Dua lists** | `dua_lists` and `dua_entries` tables are empty — `/dashboard/dua` shows "لا توجد أدعية" |
| **Tasbih presets** | `tasbih_presets` table is empty — page uses hardcoded presets; DB presets would enable admin management |

### 2.3 Missing Features (No Schema, No Frontend)

| Feature | Why Important | Effort |
|---|---|---|
| **PWA / offline** | Installable, prayer times offline | Medium |
| **Push notifications** | Prayer reminders, daily dhikr | Medium |
| **Arabic/English toggle** | next-intl wired but no toggle UI | Small |
| **Squares page** | Already blocker (broken navbar link) | Medium |
| **Profile integration** | Wire to Supabase auth + `identity.profiles` | Medium |

### 2.4 Existing Code Quality Issues

| Issue | File(s) |
|---|---|
| Duplicated `SunriseSunsetResult` type | `GeoDataCard.tsx` has inline copy — should import from `~/utils/sunrise` |
| `[id].ts` flat file alongside `[id]/route.ts` | `api/quran/[id].ts` — dead file |
| Pre-existing LSP errors | Chakra UI type resolutions, BigInt ES2020 target in `magick-square.ts` |
| Profile page is decorative | No Supabase APIs, doesn't fetch/save user data |
| Sidebar (`SidebarWithHeader`) | English placeholder nav items (Home, Trending, etc.), doesn't list actual dashboard pages, static user name |
| Landing page empty text | `DefaultText.landingPage.title` and `leadingText` are empty strings |

---

## 3. Architecture Map

```
                     ┌──────────────────────────┐
                     │      SQL Schema           │
                     │  (7 migration files,      │
                     │   spiritual tables live)  │
                     └──────────┬───────────────┘
                                │ not fully applied
                                ▼
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Frontend    │────▶│    API Routes     │────▶│   Utils/Lib    │
│  (Next.js 16)│    │  (~15 route files) │    │  (prayer,      │
│  shadcn/ui +  │    │  quran/sunrise/   │    │   astro,       │
│  Tailwind     │    │  jummal/magick/   │    │   planetary,   │
│              │    │  prayer/astro/     │    │   sunrise,     │
│              │    │  tasbih/bookmarks/ │    │   magick-sq,   │
│              │    │  journal/dua       │    │   jummal)      │
└─────────────┘     └──────────────────┘     └────────────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Supabase (live)  │
                                          │  auth + holy_names │
                                          │  + spiritual schema│
                                          └──────────────────┘
```

---

## 4. Recommended Build Order

1. **🔥 `/dashboard/squares` page** — Navbar link is broken. API + utility exist. Highest priority UX fix.
2. **🌱 Seed dua lists + tasbih presets** — Two pages show empty states. Write a seed script or Supabase migration.
3. **🔧 Profile page Supabase integration** — Wire form to user data. Fixes broken UX.
4. **📍 Rebuild sidebar in Arabic** — Current English placeholder is useless.
5. **📝 Landing page copy** — Fill empty `title`/`leadingText`.
6. **📅 Jadwal page** — Implement or redirect to squares.
7. **📖 Learn page** — Implement or remove from nav.
