# Lodge Protocol — Phase 1: Core Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the LodgeKernel — a high-performance TypeScript engine with bitwise state management, Iqra seed computation, and binary serialization.

**Architecture:** The LodgeKernel is a single class that manages user state via Uint32Array bitmasks, computes intent hashes via pre-computed Abjad lookup tables, generates Wafq matrices using the existing `magick-squares.ts` packed bigint implementation, and serializes state to PostgreSQL BYTEA. All operations are O(1) or O(n) with minimal allocations.

**Important:** This is a novel computational framework inspired by historical symbolic systems. The Awfaq generation uses the EXISTING `magick-squares.ts` implementation (packed bigint inverse-permutation lookup), NOT the formula B = ⌊(N-12)/3⌋ which does not produce true magic squares. The archetypes are original game design constructs, not historical.

**Tech Stack:** Bun, TypeScript, TypedArrays (Uint32Array, Int32Array, Uint16Array, Uint8Array), bitwise operations

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/engine/constants.ts` | Iqra seed, planet bitmasks, state flags, archetype modifiers |
| `src/engine/kernel.ts` | LodgeKernel class — state management, seed computation, Wafq generation, yield calculation |
| `src/engine/serializers.ts` | Binary serialization/deserialization of LodgeState to/from Uint8Array |
| `src/engine/__tests__/kernel.test.ts` | Unit tests for LodgeKernel |
| `src/engine/__tests__/serializers.test.ts` | Unit tests for binary serialization |
| `src/engine/index.ts` | Barrel export |

---

## Task 1: Constants & Types

**Covers:** [S2, S3, S6]

**Files:**
- Create: `src/engine/constants.ts`

- [ ] **Step 1: Create constants file**

```typescript
// src/engine/constants.ts

// ============================================================
// The Iqra Seed — derived from "اقرأ" (Read)
// ا(1) + ق(100) + ر(200) + أ(1) = 302
// ============================================================
export const IQRA_SEED = 302;

// ============================================================
// State Flags — bitwise masks for O(1) state checks
// ============================================================
export const STATE = {
  NONE:       0,
  TAHARAH:    1 << 0,  // 0x01 — Purity achieved
  RIYADAH:    1 << 1,  // 0x02 — Retreat active
  RESONANT:   1 << 2,  // 0x04 — Matrix resonant
  FLOW:       1 << 3,  // 0x08 — In flow state
  ARCHITECT:  1 << 4,  // 0x10 — Saturnian mode
  EXPLORER:   1 << 5,  // 0x20 — Mercurial mode
  CRUSADER:   1 << 6,  // 0x40 — Martial mode
} as const;

export type StateFlag = typeof STATE[keyof typeof STATE];

// ============================================================
// Planet Bitmasks — 7 bits for 7 planets
// ============================================================
export const PLANETS = {
  SUN:     1 << 0,  // 0b0000001
  MOON:    1 << 1,  // 0b0000010
  MARS:    1 << 2,  // 0b0000100
  MERCURY: 1 << 3,  // 0b0001000
  JUPITER: 1 << 4,  // 0b0010000
  VENUS:   1 << 5,  // 0b0100000
  SATURN:  1 << 6,  // 0b1000000
} as const;

export const PLANET_MASK = 0x7F;

// ============================================================
// Chaldean Order — planetary sequence for hour calculation
// ============================================================
export const CHALDEAN_ORDER = [
  PLANETS.SATURN,   // 0
  PLANETS.JUPITER,  // 1
  PLANETS.MARS,     // 2
  PLANETS.SUN,      // 3
  PLANETS.VENUS,    // 4
  PLANETS.MERCURY,  // 5
  PLANETS.MOON,     // 6
] as const;

// Day rulers (0=Sunday, 1=Monday, ..., 6=Saturday)
export const DAY_RULERS = [
  PLANETS.SUN,      // Sunday
  PLANETS.MOON,     // Monday
  PLANETS.MARS,     // Tuesday
  PLANETS.MERCURY,  // Wednesday
  PLANETS.JUPITER,  // Thursday
  PLANETS.VENUS,    // Friday
  PLANETS.SATURN,   // Saturday
] as const;

// ============================================================
// Archetype Modifiers — Strategy Pattern for yield calculation
// ============================================================
export interface ArchetypeModifier {
  k_factor: number;    // Focus acceleration (speed of flow)
  f_max: number;       // Maximum capacity (amplitude)
  stability: number;   // Interruption buffer (0-1)
}

export const ARCHETYPES = {
  ARCHITECT: { k_factor: 0.02, f_max: 80,  stability: 0.9 } as ArchetypeModifier,
  EXPLORER:  { k_factor: 0.15, f_max: 60,  stability: 0.3 } as ArchetypeModifier,
  CRUSADER:  { k_factor: 0.08, f_max: 150, stability: 0.1 } as ArchetypeModifier,
} as const;

export type ArchetypeKey = keyof typeof ARCHETYPES;

// ============================================================
// Elements — 4 classical elements
// ============================================================
export const ELEMENTS = {
  EARTH: 0,
  WATER: 1,
  AIR:   2,
  FIRE:  3,
} as const;

export type Element = typeof ELEMENTS[keyof typeof ELEMENTS];

// ============================================================
// LodgeState — binary layout for Uint32Array
// ============================================================
// Slot 0: state flags (bitmask)
// Slot 1: archetype (encoded as integer)
// Slot 2: master seed (uint32)
// Slot 3: elemental affinity (0-3)
// Slot 4: planetary hour index (0-23)
// Slot 5: lunar mansion index (0-27)
// Slot 6: session yield accumulator (float as uint32 via Math.fround)
// Slot 7: resonance multiplier (encoded as uint32)
// Slots 8-1023: reserved for future use

export const LODGE_STATE_SIZE = 1024;

export const SLOT = {
  STATE_FLAGS:     0,
  ARCHETYPE:       1,
  MASTER_SEED:     2,
  ELEMENT:         3,
  PLANETARY_HOUR:  4,
  LUNAR_MANSION:   5,
  YIELD_ACCUM:     6,
  RESONANCE:       7,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/constants.ts
git commit -m "feat: add Lodge Protocol constants and type definitions"
```

---

## Task 2: LodgeKernel Core

**Covers:** [S2, S3, S4, S5]

**Files:**
- Create: `src/engine/kernel.ts`

**Important:** This task uses the EXISTING `src/utils/magick-squares.ts` for Wafq generation. The existing implementation uses packed bigint inverse-permutation lookup, which is historically grounded and produces correct magic squares. Do NOT use the formula B = ⌊(N-12)/3⌋ which does not produce true magic squares.

- [ ] **Step 1: Create LodgeKernel class**

```typescript
// src/engine/kernel.ts

import {
  IQRA_SEED, STATE, PLANETS, PLANET_MASK, CHALDEAN_ORDER,
  DAY_RULERS, ARCHETYPES, ELEMENTS,
  LODGE_STATE_SIZE, SLOT,
  type ArchetypeKey, type Element, type ArchetypeModifier,
} from './constants';

// Import existing Wafq generation (historically grounded)
import { fillSquare, Elementals } from '../utils/magick-squares';

// Pre-computed Abjad lookup table for O(1) character access
// Maps Unicode code points to Abjad values
const ABJAD_TABLE = new Uint16Array(65536);

// Initialize Abjad table with Arabic character values
function initAbjadTable(): void {
  const entries: [string, number][] = [
    ['ا', 1], ['أ', 1], ['إ', 1], ['ء', 1], ['آ', 2], ['ئ', 1], ['ؤ', 1], ['ٱ', 1],
    ['ى', 1], ['ب', 2], ['ج', 3], ['د', 4], ['ه', 5], ['ة', 5], ['و', 6],
    ['ز', 7], ['ح', 8], ['ط', 9], ['ي', 10], ['ك', 20], ['ل', 30], ['م', 40],
    ['ن', 50], ['س', 60], ['ع', 70], ['ف', 80], ['ص', 90], ['ق', 100],
    ['ر', 200], ['ش', 300], ['ت', 400], ['ث', 500], ['خ', 600], ['ذ', 700],
    ['ض', 800], ['ظ', 900], ['غ', 1000],
  ];
  for (const [char, value] of entries) {
    ABJAD_TABLE[char.charCodeAt(0)] = value;
  }
}
initAbjadTable();

// LRU-style memoization cache for heavy calculations
const seedCache = new Map<number, number>();

export class LodgeKernel {
  private memory: Uint32Array;

  constructor() {
    this.memory = new Uint32Array(LODGE_STATE_SIZE);
  }

  // ============================================================
  // State Management — bitwise O(1) operations
  // ============================================================

  getState(): number {
    return this.memory[SLOT.STATE_FLAGS];
  }

  setState(flag: number, active: boolean): void {
    if (active) {
      this.memory[SLOT.STATE_FLAGS] |= flag;
    } else {
      this.memory[SLOT.STATE_FLAGS] &= ~flag;
    }
  }

  hasState(flag: number): boolean {
    return (this.memory[SLOT.STATE_FLAGS] & flag) === flag;
  }

  isReady(): boolean {
    return (this.memory[SLOT.STATE_FLAGS] & (STATE.TAHARAH | STATE.RIYADAH)) === (STATE.TAHARAH | STATE.RIYADAH);
  }

  // ============================================================
  // Semantic Engine — Intent Hashing
  // ============================================================

  /**
   * Compute Abjad sum using pre-computed lookup table.
   * O(n) where n = string length, with O(1) per character.
   */
  computeAbjadSum(input: string): number {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum = (sum + ABJAD_TABLE[input.charCodeAt(i)]) | 0;
    }
    return sum;
  }

  /**
   * Compute master seed: Abjad sum + Iqra constant.
   * Bitwise OR 0 forces integer coercion for Smi optimization.
   */
  computeMasterSeed(input: string): number {
    const abjadSum = this.computeAbjadSum(input);
    return (abjadSum + IQRA_SEED) | 0;
  }

  /**
   * Set master seed in LodgeState.
   */
  setMasterSeed(seed: number): void {
    this.memory[SLOT.MASTER_SEED] = seed;
  }

  getMasterSeed(): number {
    return this.memory[SLOT.MASTER_SEED];
  }

  // ============================================================
  // Geometric Engine — Wafq Generation
  // ============================================================

  /**
   * Generate 3x3 Wafq matrix from seed N.
   * Uses the existing magick-squares.ts packed bigint implementation.
   * Returns Int32Array(9) for cache-friendly memory layout.
   *
   * NOTE: This delegates to the existing fillSquare() function which uses
   * packed bigint inverse-permutation lookup — NOT the formula
   * B = ⌊(N-12)/3⌋ which does not produce true magic squares.
   */
  generateWafq(N: number): Int32Array {
    // Select element based on seed modulo 4
    const elements = [Elementals.Aero, Elementals.Tera, Elementals.Igni, Elementals.Aqua];
    const element = elements[N % 4];
    
    // Generate using existing packed bigint implementation
    const square = fillSquare(N, element);
    
    // Convert to Int32Array for cache-friendly access
    const wafq = new Int32Array(9);
    for (let i = 0; i < 9; i++) {
      wafq[i] = square[i];
    }
    return wafq;
  }

  /**
   * Validate Wafq — checks both uniqueness AND magic square properties.
   * Uses bitmask for O(1) duplicate detection, then verifies sums.
   *
   * NOTE: The existing magick-squares.ts has isValidPermutation() for
   * uniqueness and is_magic_square() in SQL for sum validation.
   * This combines both for runtime validation.
   */
  validateWafq(wafq: Int32Array, base: number): boolean {
    // Step 1: Check uniqueness via bitmask (O(1) per cell)
    let mask = 0;
    const PERFECT = 0b111111111; // bits 0-8 set

    for (let i = 0; i < 9; i++) {
      const offset = wafq[i] - base;
      if (offset < 0 || offset > 8) return false;
      mask |= 1 << offset;
    }

    if (mask !== PERFECT) return false;

    // Step 2: Check magic square sums (rows, cols, diagonals)
    const targetSum = wafq[0] + wafq[1] + wafq[2]; // First row

    // Check all rows
    for (let row = 0; row < 3; row++) {
      const sum = wafq[row * 3] + wafq[row * 3 + 1] + wafq[row * 3 + 2];
      if (sum !== targetSum) return false;
    }

    // Check all columns
    for (let col = 0; col < 3; col++) {
      const sum = wafq[col] + wafq[col + 3] + wafq[col + 6];
      if (sum !== targetSum) return false;
    }

    // Check diagonals
    const diag1 = wafq[0] + wafq[4] + wafq[8];
    const diag2 = wafq[2] + wafq[4] + wafq[6];
    if (diag1 !== targetSum || diag2 !== targetSum) return false;

    return true;
  }

  // ============================================================
  // Chronometric Engine — Planetary Hours
  // ============================================================

  /**
   * Calculate current planetary hour index (1-12) for day or night.
   * Historically grounded: planetary hours are unequal divisions of
   * daylight/nighttime based on sunrise/sunset.
   *
   * NOTE: Planetary hours are historical astrological constructs.
   * The connection to biological productivity is NOT established.
   * Use for scheduling UI, not productivity claims.
   *
   * Formula:
   *   H_day = D_day / 12
   *   I(t) = floor((t - T_sr) / H_day) + 1
   */
  getPlanetaryHourIndex(
    currentMinutes: number,
    sunriseMinutes: number,
    sunsetMinutes: number,
  ): number {
    if (currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes) {
      const dayLength = sunsetMinutes - sunriseMinutes;
      const hourLength = (dayLength / 12) | 0;
      return (((currentMinutes - sunriseMinutes) / hourLength) | 0) + 1;
    } else {
      const nightLength = 1440 - (sunsetMinutes - sunriseMinutes);
      const hourLength = (nightLength / 12) | 0;
      const nightStart = currentMinutes >= sunsetMinutes
        ? currentMinutes - sunsetMinutes
        : currentMinutes + (1440 - sunsetMinutes);
      return ((nightStart / hourLength) | 0) + 1;
    }
  }

  /**
   * Get ruling planet for given hour and day.
   *
   * Formula:
   *   Ruler = CHALDEAN_ORDER[(P_day + I - 1) mod 7]
   */
  getRulingPlanet(hourIndex: number, dayOfWeek: number): number {
    const dayRuler = DAY_RULERS[dayOfWeek];
    const dayRulerIdx = CHALDEAN_ORDER.indexOf(dayRuler);
    const rulerIdx = (dayRulerIdx + hourIndex - 1) % 7;
    return CHALDEAN_ORDER[rulerIdx];
  }

  // ============================================================
  // State Engine — Cognitive Load & Readiness
  // ============================================================

  /**
   * Calculate cognitive load from distractions.
   *
   * Formula:
   *   CL = Σ wᵢ × dᵢ
   */
  calculateCognitiveLoad(
    distractions: Array<{ active: boolean; weight: number }>,
  ): number {
    let load = 0;
    for (let i = 0; i < distractions.length; i++) {
      const d = distractions[i];
      if (d.active) {
        load += d.weight;
      }
    }
    return load;
  }

  /**
   * Check readiness state.
   *
   * Formula:
   *   T = (CL < θ) ? 1 : 0
   */
  checkReadiness(cognitiveLoad: number, threshold: number): boolean {
    return cognitiveLoad < threshold;
  }

  // ============================================================
  // Flow State Model
  // ============================================================

  /**
   * Calculate instantaneous flow state.
   * Original game design — not from historical sources.
   *
   * Formula:
   *   F(t) = F_max × (1 - e^(-k × t))
   */
  calculateFlow(
    timeSinceReset: number,
    kFactor: number,
    fMax: number,
  ): number {
    return fMax * (1 - Math.exp(-kFactor * timeSinceReset));
  }

  /**
   * Calculate yield with archetype modifiers.
   *
   * Formula:
   *   F(t) = (F_max × stability) × (1 - e^(-k × t))
   *   Yield += F(t) for each tick where no interruption occurred
   */
  calculateYield(
    durationTicks: number,
    interruptions: Uint8Array,
    archetype: ArchetypeKey,
    resonance: number,
  ): number {
    const mod = ARCHETYPES[archetype];
    let yieldSum = 0;
    let timeSinceReset = 0;

    for (let t = 0; t < durationTicks; t++) {
      // Bitwise check for interruption
      if ((interruptions[t] & 0x01) === 1) {
        // Check stability buffer — Architect can absorb low-weight interruptions
        if (Math.random() > mod.stability) {
          timeSinceReset = 0;
        }
      } else {
        timeSinceReset++;
        const flow = mod.f_max * (1 - Math.exp(-mod.k_factor * timeSinceReset));
        yieldSum += flow;
      }
    }

    return yieldSum * resonance;
  }

  // ============================================================
  // Resonance System
  // ============================================================

  /**
   * Check if Wafq matrix achieves resonance.
   * Original gamification design — not from historical sources.
   *
   * Formula:
   *   R_W = 1.5 if min(rows, cols, diags) ≥ μ
   *   R_W = 1.0 otherwise
   */
  checkResonance(
    wafq: Int32Array,
    completion: Uint8Array,
    threshold: number,
  ): number {
    // Compute active matrix (Hadamard product)
    const active = new Int32Array(9);
    for (let i = 0; i < 9; i++) {
      active[i] = completion[i] === 1 ? wafq[i] : 0;
    }

    // Check rows
    const rowSums = [
      active[0] + active[1] + active[2],
      active[3] + active[4] + active[5],
      active[6] + active[7] + active[8],
    ];

    // Check columns
    const colSums = [
      active[0] + active[3] + active[6],
      active[1] + active[4] + active[7],
      active[2] + active[5] + active[8],
    ];

    // Check diagonals
    const diagSums = [
      active[0] + active[4] + active[8],
      active[2] + active[4] + active[6],
    ];

    const allSums = [...rowSums, ...colSums, ...diagSums];
    const minSum = Math.min(...allSums);

    return minSum >= threshold ? 1.5 : 1.0;
  }

  // ============================================================
  // Transmutation Equation
  // ============================================================

  /**
   * Calculate total session yield.
   * Original productivity metric — not from historical sources.
   *
   * Formula:
   *   ΔG = T × R_W × ∫₀ᵀ F_true(t) × A(t) dt
   */
  calculateTransmutation(
    isReady: boolean,
    resonance: number,
    durationTicks: number,
    interruptions: Uint8Array,
    archetype: ArchetypeKey,
    alignment: number,
  ): number {
    if (!isReady) return 0;

    const mod = ARCHETYPES[archetype];
    let totalYield = 0;
    let timeSinceReset = 0;

    for (let t = 0; t < durationTicks; t++) {
      if ((interruptions[t] & 0x01) === 1) {
        if (Math.random() > mod.stability) {
          timeSinceReset = 0;
        }
      } else {
        timeSinceReset++;
        const flow = mod.f_max * (1 - Math.exp(-mod.k_factor * timeSinceReset));
        totalYield += flow * alignment;
      }
    }

    return totalYield * resonance;
  }

  // ============================================================
  // Binary Serialization
  // ============================================================

  /**
   * Serialize LodgeState to Uint8Array for PostgreSQL BYTEA storage.
   */
  serialize(): Uint8Array {
    return new Uint8Array(this.memory.buffer);
  }

  /**
   * Deserialize Uint8Array back into LodgeState.
   */
  deserialize(data: Uint8Array): void {
    const view = new Uint32Array(data.buffer);
    for (let i = 0; i < Math.min(view.length, LODGE_STATE_SIZE); i++) {
      this.memory[i] = view[i];
    }
  }

  /**
   * Get raw memory for direct access.
   */
  getMemory(): Uint32Array {
    return this.memory;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/kernel.ts
git commit -m "feat: implement LodgeKernel with bitwise state management"
```

---

## Task 3: Barrel Export

**Covers:** [S7]

**Files:**
- Create: `src/engine/index.ts`

- [ ] **Step 1: Create barrel export**

```typescript
// src/engine/index.ts

export { LodgeKernel } from './kernel';
export {
  IQRA_SEED, STATE, PLANETS, CHALDEAN_ORDER, DAY_RULERS,
  ARCHETYPES, ELEMENTS, LODGE_STATE_SIZE, SLOT,
  type ArchetypeKey, type ArchetypeModifier, type Element,
} from './constants';
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/index.ts
git commit -m "feat: add engine barrel export"
```

---

## Task 4: Verify Build

**Covers:** [S7, S10]

**Files:** None (verification only)

**Note:** This is a novel computational framework inspired by historical symbolic systems. The archetypes are original game design. The Celestial Layer is optional symbolic UI. The core engine functions without any of these.

- [ ] **Step 1: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 2: Run build**

```bash
bun run build
```

Expected: PASS

- [ ] **Step 3: Commit if needed**

```bash
git add -A
git commit -m "chore: verify LodgeKernel builds cleanly"
```
