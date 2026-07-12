# Lodge Protocol — Phase 4: Celestial Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the optional symbolic Celestial Layer — planetary hour integration with UI, lunar mansion sprint cycles, and optional symbolic UI themes.

**Architecture:** The Celestial Layer is an optional symbolic UI layer that maps the 7 planets and 4 elements to system modules and visual themes. It has NO historical, mathematical, or technical basis — it is pure metaphor for UI/UX organization. The engine functions without it.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, shadcn/ui, LodgeService

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/Lodge/CelestialBadge.tsx` | Planetary hour badge display |
| `src/components/Lodge/ElementIndicator.tsx` | Element affinity indicator |
| `src/app/dashboard/lodge/celestial/page.tsx` | Celestial dashboard page |

---

## Task 1: CelestialBadge Component

**Covers:** [S6]

**Files:**
- Create: `src/components/Lodge/CelestialBadge.tsx`

- [ ] **Step 1: Create CelestialBadge component**

```tsx
// src/components/Lodge/CelestialBadge.tsx

"use client";

import { cn } from "~/lib/utils";

const PLANET_COLORS: Record<string, string> = {
  SUN: "bg-yellow-500",
  MOON: "bg-slate-300",
  MARS: "bg-red-500",
  MERCURY: "bg-green-500",
  JUPITER: "bg-blue-500",
  VENUS: "bg-pink-500",
  SATURN: "bg-indigo-500",
};

const PLANET_LABELS: Record<string, string> = {
  SUN: "Sun",
  MOON: "Moon",
  MARS: "Mars",
  MERCURY: "Mercury",
  JUPITER: "Jupiter",
  VENUS: "Venus",
  SATURN: "Saturn",
};

interface CelestialBadgeProps {
  planet: string;
  className?: string;
}

/**
 * Displays the current planetary hour as a colored badge.
 * 
 * This is a symbolic UI element — the planet-to-color mapping
 * is creative metaphor, not historical correspondence.
 */
export function CelestialBadge({ planet, className }: CelestialBadgeProps) {
  const color = PLANET_COLORS[planet] ?? "bg-muted";
  const label = PLANET_LABELS[planet] ?? planet;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-background border border-border",
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {label}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Lodge/CelestialBadge.tsx
git commit -m "feat: add CelestialBadge component"
```

---

## Task 2: ElementIndicator Component

**Covers:** [S6]

**Files:**
- Create: `src/components/Lodge/ElementIndicator.tsx`

- [ ] **Step 1: Create ElementIndicator component**

```tsx
// src/components/Lodge/ElementIndicator.tsx

"use client";

import { cn } from "~/lib/utils";

const ELEMENT_COLORS: Record<number, string> = {
  0: "bg-amber-700", // Earth
  1: "bg-blue-500",  // Water
  2: "bg-gray-300",  // Air
  3: "bg-red-500",   // Fire
};

const ELEMENT_LABELS: Record<number, string> = {
  0: "Earth",
  1: "Water",
  2: "Air",
  3: "Fire",
};

interface ElementIndicatorProps {
  element: number;
  className?: string;
}

/**
 * Displays the current element affinity as a colored indicator.
 * 
 * This is a symbolic UI element — the element-to-color mapping
 * is creative metaphor, not historical correspondence.
 */
export function ElementIndicator({ element, className }: ElementIndicatorProps) {
  const color = ELEMENT_COLORS[element] ?? "bg-muted";
  const label = ELEMENT_LABELS[element] ?? "Unknown";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-background border border-border",
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {label}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Lodge/ElementIndicator.tsx
git commit -m "feat: add ElementIndicator component"
```

---

## Task 3: Celestial Dashboard Page

**Covers:** [S6, S7]

**Files:**
- Create: `src/app/dashboard/lodge/celestial/page.tsx`

- [ ] **Step 1: Create Celestial dashboard page**

```tsx
// src/app/dashboard/lodge/celestial/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CelestialBadge } from "~/components/Lodge/CelestialBadge";
import { ElementIndicator } from "~/components/Lodge/ElementIndicator";

const PLANETS = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];

/**
 * Celestial Dashboard — Optional symbolic UI layer.
 * 
 * Displays planetary hours, element affinity, and lunar mansion.
 * This is a creative metaphor layer — no historical claims.
 */
export default function CelestialPage() {
  const [currentPlanet, setCurrentPlanet] = useState("SUN");
  const [element, setElement] = useState(0);
  const [lunarMansion, setLunarMansion] = useState(1);

  // Simulate planetary hour rotation (in production, use real calculations)
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const planetIndex = Math.floor(hour / 3.43) % 7;
      setCurrentPlanet(PLANETS[planetIndex]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Celestial Layer</h1>
      <p className="text-muted-foreground">
        Optional symbolic UI — creative metaphor, not historical reconstruction.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Planetary Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Planetary Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <CelestialBadge planet={currentPlanet} />
          </CardContent>
        </Card>

        {/* Element Affinity */}
        <Card>
          <CardHeader>
            <CardTitle>Element Affinity</CardTitle>
          </CardHeader>
          <CardContent>
            <ElementIndicator element={element} />
          </CardContent>
        </Card>

        {/* Lunar Mansion */}
        <Card>
          <CardHeader>
            <CardTitle>Lunar Mansion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono">{lunarMansion}</div>
            <div className="text-sm text-muted-foreground">of 28</div>
          </CardContent>
        </Card>
      </div>

      {/* Symbolic Map */}
      <Card>
        <CardHeader>
          <CardTitle>Celestial Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium">Saturn</div>
              <div className="text-muted-foreground">Persistence</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Jupiter</div>
              <div className="text-muted-foreground">Orchestration</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Mars</div>
              <div className="text-muted-foreground">Execution</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Sun</div>
              <div className="text-muted-foreground">Core Identity</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Venus</div>
              <div className="text-muted-foreground">Experience</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Mercury</div>
              <div className="text-muted-foreground">Logic</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Moon</div>
              <div className="text-muted-foreground">Adaptation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/lodge/celestial/page.tsx
git commit -m "feat: add Celestial dashboard page"
```

---

## Task 4: Update Lodge Barrel Export

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

// Celestial components (optional symbolic UI)
export { CelestialBadge } from '../components/Lodge/CelestialBadge';
export { ElementIndicator } from '../components/Lodge/ElementIndicator';
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/index.ts
git commit -m "feat: update engine barrel export with celestial components"
```

---

## Task 5: Verify Build

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
git commit -m "chore: verify Phase 4 builds cleanly"
```
