# The Lodge Protocol — Implementation Spec

> **For agentic workers:** This spec defines a novel computational self-development framework inspired by historical symbolic systems, modern psychology, game design, chronobiology, and software architecture. It is NOT a reconstruction of Shams al-Ma'arif or historical Islamic esotericism.

## [S1] Problem

The seeker-dashboard has 9 esoteric algorithms implemented (Abjad, Wafq, prayer times, planetary hours, astro, tasbih, etc.) but they exist as disconnected features. The Lodge Protocol provides a unified computational framework to connect them into a coherent system with gamification.

**Framing:** This is a novel framework. The mathematical models (Jummal hashing, Wafq generation, planetary hours) are historically grounded. The gamification layer (archetypes, resonance, transmutation yield) is original design. The symbolic mapping (planets → software modules) is creative metaphor, not historical reconstruction.

**Goal:** Build a Cognitive Operating System that models the user as a dynamic state machine across intention, attention, time, behavior, and identity.

## [S2] Architecture — Four Engines

### Semantic Engine (Historically Grounded)
- **Purpose:** Convert intention into numerical form
- **Algorithm:** `N = Σ V(cᵢ)` (Abjad/Jummal hash — historically documented)
- **Iqra Seed:** σ_Iqra = 302 (derived from "اقرأ" using standard Abjad values)
- **Master Seed:** `(CalcJomal(dotless(input)).n + 302) | 0`
- **Files:** `src/utils/jummal.ts`, `src/utils/dotless.ts`

### Geometric Engine (Historically Grounded)
- **Purpose:** Generate a balanced task structure inspired by Awfaq tradition
- **Algorithm:** 3×3 matrix from seed N using the existing `fillSquare()` function
- **Note:** The existing `magick-squares.ts` uses packed bigint inverse-permutation lookup, NOT the formula B = ⌊(N-12)/3⌋. Use the existing implementation.
- **Files:** `src/utils/magick-squares.ts`

### Chronometric Engine (Historically Grounded)
- **Purpose:** Calculate temporal windows based on solar transit
- **Algorithms:** Planetary hours (Chaldean order, unequal hours from sunrise/sunset), prayer times (solar trigonometry), sunrise/sunset
- **Note:** Planetary hours are historical astrological constructs. The connection to biological productivity is NOT established. Use them for scheduling UI, not productivity claims.
- **Files:** `src/utils/planetary-hours.ts`, `src/utils/prayer-times.ts`, `src/utils/astro.ts`, `src/utils/sunrise.ts`

### State Engine (Original Design)
- **Purpose:** Track psychological readiness using a finite state machine
- **Algorithm:** Cognitive Load CL = Σ wᵢdᵢ, Readiness T = (CL < θ) ? 1 : 0
- **State Machine:** SCATTERED → PURIFYING → FOCUSED → FLOW → RESONANT
- **Grounding:** Plausible psychological model, not empirically validated
- **Files:** `src/engine/kernel.ts`

## [S3] Flow State Model (Original Design)

- **Flow Growth:** F(t) = F_max(1 - e^(-kt))
- **Interruption Penalty:** F_true(t) = F(t) × ∏(1 - I_t)
- **Archetype Modifiers (Game Design Constructs):**
  - Saturnian Architect: k=0.02, F_max=80, stability=0.9
  - Mercurial Explorer: k=0.15, F_max=60, stability=0.3
  - Martial Crusader: k=0.08, F_max=150, stability=0.1
- **Note:** These archetypes are original game design. They are NOT from Shams al-Ma'arif, Islamic astrology, or medieval occultism.

## [S4] Resonance System (Original Design)

- **Completion Matrix:** C where c_ij ∈ {0,1}
- **Active Matrix:** S = H ∘ C (Hadamard product)
- **Resonance:** R_W = 1.5 if min(rows, cols, diags) ≥ μ, else 1.0
- **Gamification:** Balanced habit completion yields a multiplier bonus

## [S5] Transmutation Equation (Original Design)

- **Formula:** ΔG = T × R_W × ∫₀ᵀ F_true(t) × A(t) dt
- **Interpretation:** Readiness × Focus × Timing × Balance = Progress
- **Note:** This is a novel productivity metric, not a historical concept

## [S6] Celestial Layer (Optional Symbolic UI)

- **7 Domains:** Saturn (Persistence), Jupiter (Orchestration), Mars (Execution), Sun (Core), Venus (Experience), Mercury (Logic), Moon (Adaptation)
- **4 Elements:** Earth, Water, Air, Fire
- **Note:** This is a creative metaphor for organizing system modules. It has NO historical, mathematical, or technical basis. It is pure symbolism for UI/UX naming.
- **All symbolic layers optional — engine functions without them**

## [S7] Technical Requirements

- **Runtime:** Bun + TypeScript
- **Frontend:** Next.js + Tailwind + shadcn/ui + SVG/Canvas
- **Backend:** PostgreSQL + Supabase
- **Storage:** Binary-first (Uint32Array, Int32Array, Uint8Array)
- **Optimization:** Bitwise flags, typed arrays, memoization, cache locality

## [S8] Database Schema

```sql
-- User lodge profile
users: id, lat, lng, current_archetype, lodge_state (BYTEA)

-- Session tracking
lodge_sessions: id, user_id, master_seed, wafq (JSONB), yield, created_at

-- Habit matrices
wafq_matrices: id, user_id, seed, matrix (INT[]), completion (INT[]), resonance, created_at
```

## [S9] Development Phases

### Phase 1: Core Engine
- LodgeKernel class with bitwise state management
- Iqra seed constant and master seed computation
- Binary serialization to PostgreSQL BYTEA

### Phase 2: Integration
- Connect existing algorithms (Abjad, Wafq, planetary hours, prayer times)
- State machine for user transitions
- Archetype modifier system

### Phase 3: Gamification
- Wafq habit builder UI (Canvas/SVG)
- Resonance visualization
- Yield tracking and progression

### Phase 4: Celestial Layer (Optional)
- Planetary hour integration with UI
- Lunar mansion sprint cycles
- Optional symbolic UI themes

## [S10] Success Criteria

- All 9 existing algorithms connected through the LodgeKernel
- State machine transitions working (SCATTERED → RESONANT)
- Wafq generation from user intent + Iqra seed
- Archetype modifiers affecting yield calculations
- Binary state persistence to PostgreSQL
- All symbolic layers removable without breaking core functionality

## [S11] What This Is NOT

- NOT a reconstruction of Shams al-Ma'arif
- NOT a historical interpretation of Islamic esotericism
- NOT a claim that planetary hours affect productivity
- NOT a claim that lunar mansions affect cognition
- NOT a claim that the Awfaq formula produces true magic squares
- NOT a claim that archetypes are historically grounded

## [S12] What This IS

- A novel computational self-development framework
- Inspired by historical symbolic systems (Abjad, Awfaq, planetary hours)
- Using modern psychology (flow state, habit formation, chronobiology)
- Applying game design (archetypes, resonance, progression)
- Built with high-performance software engineering (bitwise ops, typed arrays)
- A creative metaphor layer for UI/UX organization
