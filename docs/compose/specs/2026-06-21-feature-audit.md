# Feature Audit: Seeker Dashboard (الباحث)

Date: 2026-06-21
Scope: Full-stack gap analysis — frontend pages, API routes, SQL schemas, and missing features.

---

## 1. Current Feature Inventory

### 1.1 Frontend Pages

| Route | Status | Notes |
|---|---|---|
| `/` (landing) | ✅ | Hero with Quran verse, CTA buttons |
| `/learn` | ⚠️ Stub | "Work in Progress" |
| `/auth/*` (login, register, confirm, verify-email, reset-password) | ✅ | Full Supabase auth flow |
| `/dashboard` | ✅ | Jummal, GeoData, PlanetaryHours cards |
| `/dashboard/quran` | ✅ | Streaming ayah browser with jummal values |
| `/dashboard/quran/[id]` | ❌ Missing | No ayah detail route exists |
| `/dashboard/holy-names` | ✅ | Asma al-Husna table from Supabase |
| `/dashboard/jadwal` | ⚠️ Stub | Says "قيد التطوير" — **this IS the wifq/magick square page** |
| `/dashboard/squares` | ❌ Missing | Referenced in sidebar nav as "الأوفاق" — no route exists |
| `/dashboard/profile` | ⚠️ Static | Form renders but does nothing — no Supabase integration |
| `/dashboard/settings` | ❌ Missing | Referenced in sidebar — no route |
| `/blog` | ❌ Missing | Referenced in site config |
| `/about` | ❌ Missing | Referenced in site config |

### 1.2 API Routes

| Route | Status | Notes |
|---|---|---|
| `GET /api/hello` | ✅ | Basic health check |
| `GET /api/route` | ✅ | Next.js default |
| `GET /api/sunrise` | ✅ | `?lat=&lng=&date=` → sunrise-sunset API proxy |
| `GET /api/sunrise/[location]` | ✅ | Geocodes location name → coordinates → sunrise data |
| `GET /api/planetary-hours` | ✅ | `?lat=&lng=&date=` or explicit sunrise/sunset params |
| `GET /api/magick-squares` | ✅ | `?elemental=&input=` → 3×3 square + magic constant |
| `GET /api/jummal/[text]` | ✅ | Abjad calculation for Arabic text |
| `GET /api/quran` | ✅ | Streams all ayahs as NDJSON (gzip) |
| `GET /api/quran/[id]` | ✅ | Single ayah lookup |
| `POST /api/auth/*` | ✅ | Via Supabase SSR |

### 1.3 SQL Schemas (Designed, Not All Applied)

| Schema | Status | Tables/Views |
|---|---|---|
| `00_foundation.sql` | ⏳ Pending | `uuid-ossp` ext, schemas (core/identity/rbac/spiritual/audit/api/internal/magick), enums, `magick.element_config` |
| `01_identity.sql` | ⏳ Pending | `identity.profiles` with auto-create trigger, RLS |
| `02_core.sql` | ⏳ Pending | `core.tenants`, `core.tenant_memberships`, multi-tenant functions + RLS |
| `03_rbac.sql` | ⏳ Pending | `rbac.user_roles`, `rbac.role_permissions`, `authorize()` function, default role trigger |
| `04_spiritual.sql` | ⏳ Pending | `spiritual.holy_names`, `spiritual.abjad_calculations`, `api.holy_names` view, audit triggers |
| `05_magick.sql` | ⏳ Pending | `magick.square_calculations`, `fill_square()`, `is_magic_square()`, `api.square_calculations` view |
| `06_audit.sql` | ⏳ Pending | `audit.events`, `log_change()` trigger function |

> Note: Current `holy_names` table in Supabase (used by `HolyNames.tsx`) appears to be separate from the `spiritual.holy_names` schema defined in `04_spiritual.sql`.

---

## 2. Gap Analysis

### 2.1 Gaps Where SQL Schema Exists but No Frontend

| Schema Object | Has API? | Has Page? | Priority |
|---|---|---|---|
| `magick.square_calculations` | ✅ `/api/magick-squares` | ❌ **jadwal/squares page missing** | **HIGH** — closest to done |
| `api.square_calculations` view | ❌ No view endpoint | ❌ | MEDIUM |
| `spiritual.abjad_calculations` | ❌ No save endpoint | ❌ | LOW (calc already works without save) |
| `core.tenants` / `tenant_memberships` | ❌ | ❌ | MEDIUM (multi-tenant infra) |
| `rbac.user_roles` / `role_permissions` | ❌ | ❌ | MEDIUM (admin panel) |
| `identity.profiles` | ❌ No profile update | ⚠️ Static form | **HIGH** (broken UX) |
| `audit.events` | ❌ | ❌ | LOW |

### 2.2 Gaps with No Schema and No Frontend

| Feature | Why It's Important | Effort |
|---|---|---|
| **Prayer times** (Fajr/Dhuhr/Asr/Maghrib/Isha) | #1 Islamic app feature — we compute sunrise/sunset but not the 5 daily prayers. Need calculation methods (MWL, Egyptian, Umm al-Qura, etc.) | Large |
| **Qibla direction** | Compass to Mecca from geolocation | Medium |
| **Tasbih counter** (المسبحة) | Digital prayer beads with preset dhikr + custom | Small |
| **Hijri calendar** | Date conversion, Islamic months, holidays | Medium |
| **Quran detail page** (`/dashboard/quran/[id]`) | No sura index, tafsir, audio recitation, bookmarking | Large |
| **PWA / offline** | Service worker, installable, offline support | Medium |
| **Push notifications** | Prayer time reminders, daily dhikr | Medium |
| **Arabic/English language toggle** | next-intl installed but only Arabic texts defined | Small |

### 2.3 Existing Code Quality Issues

| Issue | File(s) |
|---|---|
| Duplicated `SunriseSunsetResult` type | `GeoDataCard.tsx` (has its own inline copy — should import from `~/utils/sunrise`) |
| `[id].ts` flat file alongside `[id]/route.ts` | `api/quran/[id].ts` — same pattern as the old `sunrise/[location].ts` bug |
| Pre-existing LSP errors | `quran/[id]/route.ts` (un-callable expression), `magick-square.ts` (BigInt ES2020 target) |
| Profile page is decorative | Calls no Supabase APIs, doesn't fetch/save user data |

---

## 3. Architecture Map

```
                     ┌──────────────────────────┐
                     │      SQL Schema           │
                     │  (7 migration files)      │
                     └──────────┬───────────────┘
                                │ not yet applied
                                ▼
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Frontend    │────▶│    API Routes     │────▶│   Utils/Lib    │
│  (Next.js)   │     │  (7 route groups) │     │  (planetary    │
│  Chakra/shadcn│     │  sunrise/quran/   │     │   hours,       │
│              │     │  jummal/magick/   │     │   sunrise,     │
│              │     │  planetary-hours  │     │   magick-sq,   │
│              │     │  etc.)            │     │   jummal)      │
└─────────────┘     └──────────────────┘     └────────────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Supabase (live)  │
                                          │  auth + holy_names │
                                          └──────────────────┘
```

---

## 4. Recommended Build Order

Based on dependencies and user value:

1. **Magick Squares page** (jadwal = wifq) — API exists, utility exists, schema exists. Only the UI page is missing. Direct replacement for the "قيد التطوير" stub.
2. **Profile page** — Wire the form to Supabase (`identity.profiles` update), display current user data, add avatar upload.
3. **Apply SQL schemas** — Run migrations against Supabase to bring the DB in line with the designed architecture.
4. **Settings page** — Language toggle (ar/en), theme, prayer calculation method preference.
5. **Prayer times** — Build on top of the existing sunrise/sunset infrastructure. Add calculation methods.
6. **Qibla direction** — Geodesic bearing from lat/lng to Mecca coordinates.
7. **Tasbih counter** — Simple, high-visibility feature. Low effort.
8. **Hijri calendar** — Date conversion library or API.
9. **Quran deep features** — Sura index, bookmarking, audio, tafsir.
