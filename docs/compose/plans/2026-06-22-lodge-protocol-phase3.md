# Lodge Protocol — Phase 3: Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Wafq habit builder UI, resonance visualization, and yield tracking system.

**Architecture:** The gamification layer connects the LodgeService to the frontend via API routes and React components. Users interact with a 3x3 Wafq grid, complete habits to achieve resonance, and track their transmutation yield over time.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, shadcn/ui, SVG/Canvas, LodgeService

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/api/lodge/route.ts` | Lodge API — session management, Wafq generation, yield tracking |
| `src/app/dashboard/lodge/page.tsx` | Lodge dashboard page |
| `src/components/Lodge/WafqGrid.tsx` | 3x3 Wafq habit grid component |
| `src/components/Lodge/ResonanceIndicator.tsx` | Resonance visualization |
| `src/components/Lodge/YieldDisplay.tsx` | Yield tracking display |
| `src/components/Lodge/StateIndicator.tsx` | Psychological state indicator |

---

## Task 1: Lodge API Route

**Covers:** [S7, S8]

**Files:**
- Create: `src/app/api/lodge/route.ts`

- [ ] **Step 1: Create Lodge API route**

```typescript
// src/app/api/lodge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { LodgeService } from '~/engine';
import type { ArchetypeKey } from '~/engine';

// Singleton service instance (per-request in production)
let service: LodgeService | null = null;

function getService(): LodgeService {
  if (!service) {
    service = new LodgeService();
  }
  return service;
}

/**
 * POST /api/lodge
 * 
 * Actions:
 * - start: Start a new session with intent
 * - state: Get current state
 * - transition: Transition to new state
 * - yield: Calculate session yield
 * - resonance: Check Wafq resonance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const svc = getService();

    switch (action) {
      case 'start': {
        const { userId, intent, archetype, element } = params;
        const session = svc.startSession(
          userId,
          intent,
          (archetype as ArchetypeKey) || 'ARCHITECT',
          element || 0,
        );
        return NextResponse.json({ session });
      }

      case 'state': {
        const state = svc.getState();
        return NextResponse.json({ state });
      }

      case 'transition': {
        const { to } = params;
        const result = svc.transitionState(to);
        return NextResponse.json({ success: result, state: svc.getState() });
      }

      case 'yield': {
        const { durationTicks, interruptions, resonance } = params;
        const result = svc.calculateYield(
          durationTicks,
          new Uint8Array(interruptions),
          resonance || 1.0,
        );
        return NextResponse.json({ yield: result });
      }

      case 'resonance': {
        const { wafq, completion, threshold } = params;
        const wafqArray = new Int32Array(wafq);
        const completionArray = new Uint8Array(completion);
        const resonance = svc.checkResonance(wafqArray, completionArray, threshold || 10);
        return NextResponse.json({ resonance });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/lodge
 * 
 * Get current session state.
 */
export async function GET() {
  const svc = getService();
  const session = svc.getSession();
  const state = svc.getState();
  return NextResponse.json({ session, state });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/lodge/route.ts
git commit -m "feat: add Lodge API route for session management"
```

---

## Task 2: WafqGrid Component

**Covers:** [S3, S4]

**Files:**
- Create: `src/components/Lodge/WafqGrid.tsx`

- [ ] **Step 1: Create WafqGrid component**

```tsx
// src/components/Lodge/WafqGrid.tsx

"use client";

import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";

interface WafqGridProps {
  matrix: number[];
  completion: boolean[];
  onCellToggle: (index: number) => void;
  disabled?: boolean;
}

/**
 * 3x3 Wafq habit grid component.
 * 
 * Each cell represents a micro-habit or task.
 * Completing cells creates resonance when the grid is balanced.
 * 
 * This is an original gamification design — not from historical sources.
 */
export function WafqGrid({
  matrix,
  completion,
  onCellToggle,
  disabled = false,
}: WafqGridProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const getCellColor = useCallback(
    (index: number) => {
      if (completion[index]) {
        return "bg-brand-500 text-white";
      }
      if (hoveredCell === index && !disabled) {
        return "bg-brand-100 dark:bg-brand-900/30";
      }
      return "bg-muted";
    },
    [completion, hoveredCell, disabled]
  );

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[300px]">
      {matrix.map((value, index) => (
        <button
          key={index}
          onClick={() => !disabled && onCellToggle(index)}
          onMouseEnter={() => setHoveredCell(index)}
          onMouseLeave={() => setHoveredCell(null)}
          disabled={disabled}
          className={cn(
            "aspect-square flex items-center justify-center rounded-lg",
            "text-lg font-mono font-bold transition-all duration-200",
            "border border-border/50",
            getCellColor(index),
            !disabled && "cursor-pointer hover:scale-105",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Lodge/WafqGrid.tsx
git commit -m "feat: add WafqGrid habit grid component"
```

---

## Task 3: ResonanceIndicator Component

**Covers:** [S4]

**Files:**
- Create: `src/components/Lodge/ResonanceIndicator.tsx`

- [ ] **Step 1: Create ResonanceIndicator component**

```tsx
// src/components/Lodge/ResonanceIndicator.tsx

"use client";

import { cn } from "~/lib/utils";

interface ResonanceIndicatorProps {
  resonance: number;
  className?: string;
}

/**
 * Visual indicator showing Wafq resonance state.
 * 
 * resonance === 1.5 → "Resonant" (green glow)
 * resonance === 1.0 → "Not Resonant" (muted)
 */
export function ResonanceIndicator({
  resonance,
  className,
}: ResonanceIndicatorProps) {
  const isResonant = resonance > 1.0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        isResonant
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isResonant ? "bg-green-500 animate-pulse" : "bg-muted-foreground/50"
        )}
      />
      {isResonant ? "Resonant" : "Not Resonant"}
      {isResonant && (
        <span className="text-green-600 dark:text-green-400">
          ×{resonance}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Lodge/ResonanceIndicator.tsx
git commit -m "feat: add ResonanceIndicator component"
```

---

## Task 4: YieldDisplay Component

**Covers:** [S5]

**Files:**
- Create: `src/components/Lodge/YieldDisplay.tsx`

- [ ] **Step 1: Create YieldDisplay component**

```tsx
// src/components/Lodge/YieldDisplay.tsx

"use client";

import { cn } from "~/lib/utils";
import type { YieldResult } from "~/engine";

interface YieldDisplayProps {
  yieldResult: YieldResult | null;
  className?: string;
}

/**
 * Displays transmutation yield results.
 * 
 * Shows total yield, flow time, interruptions, and archetype.
 */
export function YieldDisplay({
  yieldResult,
  className,
}: YieldDisplayProps) {
  if (!yieldResult) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        No yield data yet. Complete a session to see results.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total Yield</span>
        <span className="text-lg font-bold text-brand-500">
          {Math.round(yieldResult.totalYield)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Flow Time</span>
        <span className="text-sm font-mono">{yieldResult.flowTime} ticks</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Interruptions</span>
        <span
          className={cn(
            "text-sm font-mono",
            yieldResult.interruptions > 0
              ? "text-red-500"
              : "text-green-500"
          )}
        >
          {yieldResult.interruptions}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Resonance</span>
        <span className="text-sm font-mono">×{yieldResult.resonance}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Archetype</span>
        <span className="text-sm font-mono capitalize">
          {yieldResult.archetype.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Lodge/YieldDisplay.tsx
git commit -m "feat: add YieldDisplay component"
```

---

## Task 5: Lodge Dashboard Page

**Covers:** [S7, S10]

**Files:**
- Create: `src/app/dashboard/lodge/page.tsx`

- [ ] **Step 1: Create Lodge dashboard page**

```tsx
// src/app/dashboard/lodge/page.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { WafqGrid } from "~/components/Lodge/WafqGrid";
import { ResonanceIndicator } from "~/components/Lodge/ResonanceIndicator";
import { YieldDisplay } from "~/components/Lodge/YieldDisplay";
import type { LodgeSession, YieldResult, PsychologicalState } from "~/engine";

/**
 * Lodge Dashboard — Main interface for the Lodge Protocol.
 * 
 * Users can:
 * - Enter an intent and start a session
 * - View their 3x3 Wafq habit grid
 * - Complete habits to achieve resonance
 * - Track their transmutation yield
 */
export default function LodgePage() {
  const [intent, setIntent] = useState("");
  const [session, setSession] = useState<LodgeSession | null>(null);
  const [completion, setCompletion] = useState<boolean[]>(Array(9).fill(false));
  const [resonance, setResonance] = useState(1.0);
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const [state, setState] = useState<PsychologicalState>("SCATTERED");
  const [loading, setLoading] = useState(false);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!intent.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/lodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: "demo-user",
          intent: intent.trim(),
          archetype: "ARCHITECT",
        }),
      });
      const data = await res.json();
      setSession(data.session);
      setCompletion(Array(9).fill(false));
      setResonance(1.0);
      setYieldResult(null);
      setState("FOCUSED");
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setLoading(false);
    }
  }, [intent]);

  // Toggle habit completion
  const toggleCell = useCallback(
    async (index: number) => {
      if (!session) return;

      const newCompletion = [...completion];
      newCompletion[index] = !newCompletion[index];
      setCompletion(newCompletion);

      // Check resonance
      try {
        const res = await fetch("/api/lodge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "resonance",
            wafq: Array.from(session.wafq),
            completion: newCompletion.map((c) => (c ? 1 : 0)),
            threshold: 10,
          }),
        });
        const data = await res.json();
        setResonance(data.resonance);

        if (data.resonance > 1.0) {
          setState("RESONANT");
        }
      } catch (error) {
        console.error("Failed to check resonance:", error);
      }
    },
    [session, completion]
  );

  // Calculate yield
  const calculateYield = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch("/api/lodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "yield",
          durationTicks: 100,
          interruptions: Array(100).fill(0),
          resonance,
        }),
      });
      const data = await res.json();
      setYieldResult(data.yield);
    } catch (error) {
      console.error("Failed to calculate yield:", error);
    }
  }, [session, resonance]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Lodge</h1>

      {/* Intent Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Intent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="e.g., Deep Focus, Creative Flow, Learning"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startSession()}
          />
          <Button onClick={startSession} disabled={loading || !intent.trim()}>
            {loading ? "Starting..." : "Start Session"}
          </Button>
        </CardContent>
      </Card>

      {/* Wafq Grid */}
      {session && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Wafq Grid</CardTitle>
            <ResonanceIndicator resonance={resonance} />
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <WafqGrid
              matrix={Array.from(session.wafq)}
              completion={completion}
              onCellToggle={toggleCell}
            />
            <div className="text-sm text-muted-foreground">
              Seed: {session.masterSeed} | Magic Constant: {session.magicConst}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yield Display */}
      {session && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transmutation Yield</CardTitle>
            <Button variant="outline" size="sm" onClick={calculateYield}>
              Calculate
            </Button>
          </CardHeader>
          <CardContent>
            <YieldDisplay yieldResult={yieldResult} />
          </CardContent>
        </Card>
      )}

      {/* State Indicator */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Psychological State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="font-mono">{state}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/lodge/page.tsx
git commit -m "feat: add Lodge dashboard page"
```

---

## Task 6: Verify Build

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
git commit -m "chore: verify Phase 3 builds cleanly"
```
