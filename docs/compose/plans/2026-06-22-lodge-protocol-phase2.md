# Lodge Protocol — Phase 2: Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the LodgeKernel to existing algorithms (Abjad, Wafq, planetary hours, prayer times), implement the state machine for user transitions, and wire up the archetype modifier system.

**Architecture:** The LodgeService wraps the kernel and provides a high-level API for the SaaS. It reads user location from geolocation, fetches prayer times, calculates planetary hours, computes intent seeds from user input, and returns Wafq matrices with archetype modifiers applied.

**Tech Stack:** Bun, TypeScript, Next.js App Router, Supabase, existing utils (jummal.ts, magick-squares.ts, planetary-hours.ts, prayer-times.ts, astro.ts)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/engine/service.ts` | LodgeService — high-level API connecting kernel to SaaS |
| `src/engine/state-machine.ts` | StateMachine — user state transitions (SCATTERED → RESONANT) |
| `src/engine/__tests__/service.test.ts` | Unit tests for LodgeService |
| `src/engine/__tests__/state-machine.test.ts` | Unit tests for StateMachine |

---

## Task 1: State Machine

**Covers:** [S2, S3]

**Files:**
- Create: `src/engine/state-machine.ts`

- [ ] **Step 1: Create StateMachine class**

```typescript
// src/engine/state-machine.ts

import { STATE, type StateFlag } from './constants';

/**
 * Psychological State Machine
 *
 * Transitions:
 *   SCATTERED → PURIFYING (user acknowledges distractions)
 *   PURIFYING → FOCUSED (cognitive load drops below threshold)
 *   FOCUSED → FLOW (flow state begins)
 *   FLOW → RESONANT (Wafq matrix achieves resonance)
 *   Any → SCATTERED (interruption or reset)
 *
 * This is an original design — not from historical sources.
 */

export type PsychologicalState =
  | 'SCATTERED'
  | 'PURIFYING'
  | 'FOCUSED'
  | 'FLOW'
  | 'RESONANT';

const STATE_MAP: Record<PsychologicalState, number> = {
  SCATTERED: 0,
  PURIFYING: STATE.TAHARAH,
  FOCUSED: STATE.TAHARAH | STATE.RIYADAH,
  FLOW: STATE.TAHARAH | STATE.RIYADAH | STATE.FLOW,
  RESONANT: STATE.TAHARAH | STATE.RIYADAH | STATE.FLOW | STATE.RESONANT,
};

const VALID_TRANSITIONS: Record<PsychologicalState, PsychologicalState[]> = {
  SCATTERED: ['PURIFYING'],
  PURIFYING: ['FOCUSED', 'SCATTERED'],
  FOCUSED: ['FLOW', 'SCATTERED'],
  FLOW: ['RESONANT', 'SCATTERED'],
  RESONANT: ['SCATTERED'],
};

export class StateMachine {
  private current: PsychologicalState = 'SCATTERED';
  private history: Array<{ state: PsychologicalState; timestamp: number }> = [];

  constructor() {
    this.history.push({ state: this.current, timestamp: Date.now() });
  }

  /**
   * Get current state.
   */
  getState(): PsychologicalState {
    return this.current;
  }

  /**
   * Get state as bitmask for LodgeKernel.
   */
  getStateBitmask(): number {
    return STATE_MAP[this.current];
  }

  /**
   * Attempt state transition.
   * Returns true if transition is valid, false otherwise.
   */
  transition(to: PsychologicalState): boolean {
    const allowed = VALID_TRANSITIONS[this.current];
    if (!allowed.includes(to)) {
      return false;
    }

    this.current = to;
    this.history.push({ state: to, timestamp: Date.now() });
    return true;
  }

  /**
   * Force reset to SCATTERED (interruption or manual reset).
   */
  reset(): void {
    this.current = 'SCATTERED';
    this.history.push({ state: 'SCATTERED', timestamp: Date.now() });
  }

  /**
   * Get state history.
   */
  getHistory(): Array<{ state: PsychologicalState; timestamp: number }> {
    return [...this.history];
  }

  /**
   * Get time spent in current state (ms).
   */
  getTimeInState(): number {
    const last = this.history[this.history.length - 1];
    return Date.now() - last.timestamp;
  }

  /**
   * Check if state is at or beyond a given state.
   */
  isAtOrBeyond(state: PsychologicalState): boolean {
    const order: PsychologicalState[] = ['SCATTERED', 'PURIFYING', 'FOCUSED', 'FLOW', 'RESONANT'];
    return order.indexOf(this.current) >= order.indexOf(state);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/state-machine.ts
git commit -m "feat: add psychological state machine for Lodge Protocol"
```

---

## Task 2: LodgeService

**Covers:** [S2, S3, S7, S8]

**Files:**
- Create: `src/engine/service.ts`

- [ ] **Step 1: Create LodgeService class**

```typescript
// src/engine/service.ts

import { LodgeKernel } from './kernel';
import { StateMachine, type PsychologicalState } from './state-machine';
import { IQRA_SEED, ARCHETYPES, type ArchetypeKey } from './constants';

// Import existing algorithms
import { CalcJomal } from '~/utils/jummal';
import { fillSquare, magicConstant, isValidPermutation } from '~/utils/magick-squares';

/**
 * LodgeService — High-level API connecting the LodgeKernel to the SaaS.
 *
 * Provides a clean interface for:
 * - Computing intent seeds from user input
 * - Generating Wafq matrices
 * - Managing user state transitions
 * - Applying archetype modifiers
 * - Tracking session yield
 *
 * This is the primary entry point for the Lodge Protocol in the SaaS.
 */

export interface LodgeSession {
  userId: string;
  intent: string;
  masterSeed: number;
  wafq: Int32Array;
  magicConst: number;
  archetype: ArchetypeKey;
  state: PsychologicalState;
  element: number;
  createdAt: number;
}

export interface YieldResult {
  totalYield: number;
  flowTime: number;
  interruptions: number;
  resonance: number;
  archetype: ArchetypeKey;
}

export class LodgeService {
  private kernel: LodgeKernel;
  private stateMachine: StateMachine;
  private session: LodgeSession | null = null;

  constructor() {
    this.kernel = new LodgeKernel();
    this.stateMachine = new StateMachine();
  }

  // ============================================================
  // Session Management
  // ============================================================

  /**
   * Start a new Lodge session with user intent.
   *
   * Process:
   * 1. Compute Abjad sum from intent
   * 2. Add Iqra seed constant
   * 3. Generate Wafq matrix from master seed
   * 4. Apply archetype modifier
   */
  startSession(
    userId: string,
    intent: string,
    archetype: ArchetypeKey = 'ARCHITECT',
    element: number = 0,
  ): LodgeSession {
    // Compute master seed: Abjad sum + Iqra constant
    const masterSeed = this.kernel.computeMasterSeed(intent);

    // Generate Wafq matrix
    const wafq = this.kernel.generateWafq(masterSeed);

    // Compute magic constant
    const magicConst = magicConstant(masterSeed);

    // Create session
    this.session = {
      userId,
      intent,
      masterSeed,
      wafq,
      magicConst,
      archetype,
      state: this.stateMachine.getState(),
      element,
      createdAt: Date.now(),
    };

    // Set kernel state
    this.kernel.setMasterSeed(masterSeed);
    this.kernel.setState(ARCHETYPES[archetype] ? (1 << (4 + ['ARCHITECT', 'EXPLORER', 'CRUSADER'].indexOf(archetype))) : 0, true);

    return this.session;
  }

  /**
   * Get current session.
   */
  getSession(): LodgeSession | null {
    return this.session;
  }

  // ============================================================
  // Intent Processing
  // ============================================================

  /**
   * Compute intent seed from user input.
   * Uses existing CalcJomal + Iqra constant.
   */
  computeIntentSeed(input: string): number {
    return this.kernel.computeMasterSeed(input);
  }

  /**
   * Get Abjad breakdown for display.
   */
  getAbjadBreakdown(input: string): { ge: number; gw: number; se: number; sw: number; n: number } {
    return CalcJomal(input);
  }

  // ============================================================
  // Wafq Operations
  // ============================================================

  /**
   * Generate Wafq from seed.
   */
  generateWafq(seed: number): Int32Array {
    return this.kernel.generateWafq(seed);
  }

  /**
   * Validate Wafq matrix.
   */
  validateWafq(wafq: Int32Array, base: number): boolean {
    return this.kernel.validateWafq(wafq, base);
  }

  /**
   * Check Wafq resonance with completion state.
   */
  checkResonance(wafq: Int32Array, completion: Uint8Array, threshold: number): number {
    return this.kernel.checkResonance(wafq, completion, threshold);
  }

  // ============================================================
  // State Machine
  // ============================================================

  /**
   * Get current psychological state.
   */
  getState(): PsychologicalState {
    return this.stateMachine.getState();
  }

  /**
   * Transition to a new state.
   */
  transitionState(to: PsychologicalState): boolean {
    const result = this.stateMachine.transition(to);
    if (result && this.session) {
      this.session.state = this.stateMachine.getState();
    }
    return result;
  }

  /**
   * Reset to SCATTERED state.
   */
  resetState(): void {
    this.stateMachine.reset();
    if (this.session) {
      this.session.state = 'SCATTERED';
    }
  }

  // ============================================================
  // Archetype System
  // ============================================================

  /**
   * Set active archetype.
   */
  setArchetype(archetype: ArchetypeKey): void {
    if (this.session) {
      this.session.archetype = archetype;
    }
  }

  /**
   * Get archetype modifier.
   */
  getArchetypeModifier(archetype: ArchetypeKey) {
    return ARCHETYPES[archetype];
  }

  // ============================================================
  // Yield Calculation
  // ============================================================

  /**
   * Calculate session yield with archetype modifiers.
   */
  calculateYield(
    durationTicks: number,
    interruptions: Uint8Array,
    resonance: number,
  ): YieldResult {
    const archetype = this.session?.archetype ?? 'ARCHITECT';
    const totalYield = this.kernel.calculateYield(
      durationTicks,
      interruptions,
      archetype,
      resonance,
    );

    // Count interruptions
    let interruptionCount = 0;
    for (let i = 0; i < interruptions.length; i++) {
      if ((interruptions[i] & 0x01) === 1) interruptionCount++;
    }

    return {
      totalYield,
      flowTime: durationTicks - interruptionCount,
      interruptions: interruptionCount,
      resonance,
      archetype,
    };
  }

  // ============================================================
  // Binary Serialization
  // ============================================================

  /**
   * Serialize current state to Uint8Array for storage.
   */
  serialize(): Uint8Array {
    return this.kernel.serialize();
  }

  /**
   * Deserialize state from Uint8Array.
   */
  deserialize(data: Uint8Array): void {
    this.kernel.deserialize(data);
  }

  // ============================================================
  // Access to underlying kernel
  // ============================================================

  getKernel(): LodgeKernel {
    return this.kernel;
  }

  getStateMachine(): StateMachine {
    return this.stateMachine;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/service.ts
git commit -m "feat: add LodgeService connecting kernel to SaaS"
```

---

## Task 3: Update Barrel Export

**Covers:** [S7]

**Files:**
- Modify: `src/engine/index.ts`

- [ ] **Step 1: Update barrel export**

```typescript
// src/engine/index.ts

export { LodgeKernel } from './kernel';
export { LodgeService } from './service';
export { StateMachine } from './state-machine';
export type { LodgeSession, YieldResult } from './service';
export type { PsychologicalState } from './state-machine';
export {
  IQRA_SEED, STATE, PLANETS, CHALDEAN_ORDER, DAY_RULERS,
  ARCHETYPES, ELEMENTS, LODGE_STATE_SIZE, SLOT,
  type ArchetypeKey, type ArchetypeModifier, type Element,
} from './constants';
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/index.ts
git commit -m "feat: update engine barrel export with service and state machine"
```

---

## Task 4: Verify Build

**Covers:** [S7, S10]

**Files:** None (verification only)

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
git commit -m "chore: verify Phase 2 builds cleanly"
```
