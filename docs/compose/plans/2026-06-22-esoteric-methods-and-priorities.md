# Esoteric Methods Extraction & Next Priorities

Date: 2026-06-22
Source: *Kitāb Shams al-Maʻārif al-Kubrá* (Aḥmad al-Būnī, d. 1225), Cairo 1928 ed. — 546 pages
Context: Extracting systematic/procedural knowledge as runnable modules.

---

## 1. Already Implemented

These esoteric methods from the tradition are already present:

| Method | Module | What It Does |
|---|---|---|
| **Abjad / Ḥisāb al-Jummal** | `utils/jummal.ts`, `api/jummal/` | Character→number lookup (5 systems: grand east/west, small east/west, nafsī). Uses typed arrays + memoization. |
| **Wafq (3×3 Magic Square)** | `utils/magick-squares.ts`, `api/magick-squares/` | 4 elemental 3×3 squares packed as bigint nibbles. O(1) position lookup. |
| **Planetary Hours** | `utils/planetary-hours.ts`, `api/planetary-hours/` | Chaldean order, day/night hour rulers, dawn/dusk division. |
| **Moon Phases** | `utils/astro.ts` | Phase classification, age, illumination, next new/full moon. |
| **Qibla Direction** | `utils/astro.ts` | Great-circle bearing to Kaaba (21.4225°N, 39.8262°E). |
| **Sun Times** | `utils/astro.ts`, `utils/sunrise.ts` | Sunrise/sunset/solar noon. |
| **Prayer Times** | `utils/prayer-times.ts`, `api/prayer/` | 7 calculation methods (MWL, ISNA, Egypt, UmmAlQura, Karachi, Tehran, Jafari). |

---

## 2. Extractable Methods from al-Būnī's System

### Priority A — Directly Runnable as Standalone Utils

#### A1. Taksīr (تكسير) — Recursive Name Factorization

**What it is:** Decomposing a name/word's abjad sum into its prime factors or into smaller abjad-matched phrases. For example, a sum of 20 might decompose to 10+10 (word ي = 10, repeated) or 8+12 (ح=8 + ه=12).

**Algorithm:** Recursive partition of integer N into additive components that themselves correspond to valid abjad words.

```
function taksir(n):
  for each subset of abjad entries with sum ≤ n:
    if sum == n: emit [entry.keys]
    else: recurse with remaining entries, depth-limited
```

**Utility:** `utils/taksir.ts` — exports `factorizeAbjad(sum: number, maxDepth?: number): string[][]`

**Connects to:** `utils/jummal.ts` (uses same abjad table), talismanic name construction.

#### A2. Taṣfīr (تصفير) — Letter Permutation

**What it is:** Generating all permutations of a set of letters to extract hidden names (based on the principle that Divine Names can be revealed by permuting the letters of a known phrase).

**Algorithm:** Heap's algorithm or recursive nPr over Arabic letter array, filtered by:
- Length constraints (typically 3, 4, or 7 letter groups)
- Compatibility with Arabic phonotactics
- Pre-existing known names as target list

```
function tasfir(letters, length):
  for each permutation of length:
    if is_valid_arabic_word(perm):
      emit perm
```

**Utility:** `utils/tasfir.ts` — exports `permuteLetters(letters: string[], length: number): string[]`

**Connects to:** The existing `magick-squares.ts` (permuted names feed into square generation).

#### A3. Wafq Property Validation

**What it is:** Verifying that a magic square satisfies all traditional constraints:
- Sum of each row = sum of each column = sum of each diagonal = magic constant
- No repeated numbers
- Proper elemental offset layout (the 9 offsets 0-8 appear exactly once)

**Algorithm:** Bitmask validation (already designed in earlier analysis).

```typescript
function validateWafq(square: number[], base: number): boolean {
  let bitmask = 0;
  const PERFECT = 0b111111111; // 511
  for (const val of square) {
    const offset = val - base;
    if (offset < 0 || offset > 8) return false;
    bitmask |= (1 << offset);
  }
  return bitmask === PERFECT;
}
```

**Utility:** Add to `utils/magick-squares.ts` — exports `validateWafq(square: number[], base: number): boolean`

**Priority:** **HIGH** — 5 lines, immediately useful for UI display of square correctness.

---

### Priority B — Integrates with Existing API Routes

#### B1. Zā'irja (زائرج) — Letter → Planet → Element Mapping

**What it is:** A multi-dimensional lookup table that maps each Arabic letter to:
- Its abjad value (existing)
- Its planetary ruler (Saturn/Jupiter/Mars/Sun/Venus/Mercury/Moon)
- Its elemental attribution (Fire/Earth/Air/Water)
- Its zodiacal correspondence

**Data structure:** Static JSON/LUT joining the existing abjad table with planetary-hours and astro modules.

```typescript
interface ZairjaEntry {
  letter: string;
  abjad: number;
  planet: Planet;       // from planetary-hours.ts
  element: Elementals;  // from magick-squares.ts
  zodiac?: string;
}
```

**Utility:** `utils/zairja.ts` — exports `getZairja(letter: string): ZairjaEntry` and `getLetterForPlanet(planet: Planet): string[]`

**Connects to:** `planetary-hours.ts` (planet enum), `magick-squares.ts` (element enum), `astro.ts` (zodiac from sun position).

#### B2. al-Kawākib al-Sab'a (الكواكب السبعة) — Planetary Ritual Timing Table

**What it is:** Cross-referencing planetary hours with moon phase and day of week to determine optimal timing for operations.

**Algorithm:** Join `computePlanetaryHours()` output with moon phase and fixed planetary correspondences.

```typescript
interface OptimalTiming {
  planet: Planet;
  day: string;
  hourIndex: number;
  moonPhase: string;
  score: number; // 0-10 favorability
}
```

**Utility:** Add to `utils/planetary-hours.ts` — exports `rankPlanetaryHours(date: Date, lat: number, lng: number): OptimalTiming[]`

**Connects to:** `astro.ts` (moon phase), `planetary-hours.ts` (hours).

---

### Priority C — New Feature Module

#### C1. Khatt al-Raml (خط الرمل) — Geomancy

**What it is:** 16-figure divination system. Generate 4 binary "mother figures" from random dot patterns, then derive 12 more figures through XOR operations on the binary rows.

**Algorithm:**
```
1. Generate 4 × 4 = 16 binary dots (odd/even)
2. Arrange into 4 "mother" figures (each 4-bit: {head, neck, body, foot})
3. Generate 4 "daughter" figures by reading columns
4. Generate nieces, witnesses, judge by XOR pairs
5. Parse into houses (1-16) for interpretation
```

```
// Each geomantic figure is 4 bits
// mother[0].head = dot[0], mother[0].neck = dot[4],
// mother[0].body = dot[8], mother[0].foot = dot[12]
// daughter[0] = xor of mother bits at position 0 across 4 mothers
```

**Utility:** `utils/raml.ts` — exports `castGeomancy(seed?: number): GeomancyChart`

**Data:** `data/raml-figures.ts` — 16 figure definitions (name, arabic, binary, meaning, element, planet, direction).

---

### Priority D — Data / Seed Migration

#### D1. Awfaq Layouts for Higher Orders

Current `magick-squares.ts` only handles 3×3. al-Būnī details 4×4 (muthamman), 5×5 (mu'ashshar), 7×7 (sab'ī) squares. These are significantly more complex — each order has different placement rules.

**Utility:** Extend `utils/magick-squares.ts` with:
- `generate4x4(targetSum, method)` — bounded magic squares with specific patterns
- `generate5x5(targetSum)` — recursive bordered square algorithm
- `generateNxN(n, targetSum)` — general case using Siamese method for odd orders

---

## 3. Implementation Order (Esoteric Methods)

| Order | Feature | Effort | Dependencies | Value |
|---|---|---|---|---|
| 1 | **Wafq validation** (±3 lines) | Trivial | None | Immediate quality-of-life for squares UI |
| 2 | **Taksīr** (name factorization) | Small | `jummal.ts` | Reuses existing data; unlocks talisman building |
| 3 | **Zā'irja** (letter→planet→element table) | Small | `planetary-hours.ts`, `magick-squares.ts` | Bridges 3 existing modules |
| 4 | **Taṣfīr** (letter permutation) | Medium | None (standalone) | Combinatorial engine for name discovery |
| 5 | **Khatt al-Raml** (geomancy) | Medium | None (standalone) | New feature, high user engagement |
| 6 | **Planetary timing ranking** | Small | `planetary-hours.ts`, `astro.ts` | High-value cross-module feature |
| 7 | **Higher-order wafq** | Large | `magick-squares.ts` | Significant algorithmic complexity |

---

## 4. Project-Wide Next Priorities (Combined)

Ranked by user-facing impact:

| # | What | Type | Effort | Why Now |
|---|---|---|---|---|
| 1 | **`/dashboard/squares` page** | Fix broken nav | Medium | Navbar link is dead — worst UX failure |
| 2 | **Wafq validation** | Add to `magick-squares.ts` | Trivial | Backend quality gate for the squares page |
| 3 | **Seed dua lists + tasbih presets** | Data migration | Small | /dua and /tasbih show empty states |
| 4 | **Profile → Supabase** | Wire form | Medium | Broken UX — form doesn't save |
| 5 | **Rebuild sidebar (Arabic, real links)** | UI | Medium | Current sidebar is English placeholder, all 6 new pages missing |
| 6 | **Taksīr (name factorization)** | New util | Small | High value for talisman workflow |
| 7 | **Zā'irja (letter→planet→element)** | New util | Small | Bridges jummal + planetary-hours + magick-squares |
| 8 | **Khatt al-Raml (geomancy)** | New feature | Medium | Completely new, high engagement potential |
| 9 | **Landing page copy** | Text | Trivial | Empty title/leadingText in DefaultText |
| 10 | **Jadwal → redirect or implement** | Fix stub | Small | "قيد التطوير" stub |
| 11 | **Higher-order wafq (4×4, 5×5, 7×7)** | New algorithm | Large | Advanced magick feature |

---

## 5. Architecture — How Methods Connect

```
                       ┌───────────────────┐
                       │   Shams al-Ma'arif │
                       │    Methods Layer   │
                       └─────────┬─────────┘
                                 │ 
       ┌───────────┬─────────────┼──────────────┬──────────────┐
       ▼           ▼             ▼              ▼              ▼
  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
  │ jummal  │ │ tasfir  │ │  taksir  │ │  raml    │ │   zairja     │
  │ (abjad) │ │ (perm)  │ │ (factor) │ │(geomancy)│ │(LUT bridge)  │
  └────┬────┘ └─────────┘ └────┬─────┘ └──────────┘ └──┬───┬───────┘
       │                       │                        │   │
       ▼                       ▼                        ▼   ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                   Existing Utilities                         │
  │  magick-squares · planetary-hours · astro · sunrise · prayer │
  └──────────────────────────────────────────────────────────────┘
```

Each new method extracts a specific systematic procedure from the text and plugs into the existing infrastructure. The Zā'irja module is the keystone — it creates the relational joins that tie the other modules together into a coherent system.
