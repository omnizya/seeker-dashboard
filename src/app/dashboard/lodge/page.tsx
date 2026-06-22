"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import WafqGrid from "~/components/Lodge/WafqGrid";
import ResonanceIndicator from "~/components/Lodge/ResonanceIndicator";
import YieldDisplay from "~/components/Lodge/YieldDisplay";
import type {
  LodgeSession,
  YieldResult,
  PsychologicalState,
} from "~/engine";

type WafqResult = { cells: number[]; magicConst: number };

export default function LodgePage() {
  const [intent, setIntent] = useState("");
  const [session, setSession] = useState<LodgeSession | null>(null);
  const [psychState, setPsychState] = useState<PsychologicalState>("SCATTERED");
  const [matrix, setMatrix] = useState<number[]>(Array(9).fill(0));
  const [completion, setCompletion] = useState<boolean[]>(Array(9).fill(false));
  const [resonance, setResonance] = useState(1.0);
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/lodge")
      .then((r) => r.json())
      .then((json) => {
        if (json.session) {
          setSession(json.session);
          const wafq = json.session.wafq as WafqResult | null;
          if (wafq?.cells) {
            setMatrix(wafq.cells);
            setCompletion(Array(9).fill(true));
          }
        }
        if (json.state) {
          setPsychState(json.state);
        }
      })
      .catch(() => {});
  }, []);

  const startSession = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", intent: intent.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to start session");
        return;
      }
      setSession(json.session);
      setPsychState(json.state);
      const wafq = json.session.wafq as WafqResult | null;
      if (wafq?.cells) {
        setMatrix(wafq.cells);
        setCompletion(Array(9).fill(true));
      }
      setYieldResult(null);
      setResonance(1.0);
      startTimeRef.current = Date.now();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCellToggle = async (index: number) => {
    const next = [...completion];
    next[index] = !next[index];
    setCompletion(next);

    const toggledCells = next
      .map((c, i) => (c ? i : -1))
      .filter((i) => i >= 0);
    const completionRatio = toggledCells.length / 9;

    try {
      const res = await fetch("/api/lodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resonance",
          cells: toggledCells,
          completion: completionRatio,
        }),
      });
      const json = await res.json();
      if (json.resonance) {
        setResonance(json.resonance.multiplier);
      }
    } catch {
      // keep previous resonance on error
    }
  };

  const calculateYield = async () => {
    if (!startTimeRef.current) return;
    setLoading(true);
    const durationTicks = Math.floor(
      (Date.now() - startTimeRef.current) / 1000,
    );
    const interruptionCount = completion.filter((c) => !c).length;
    try {
      const res = await fetch("/api/lodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "yield",
          durationTicks,
          interruptions: interruptionCount,
          resonance: resonance >= 1.5,
        }),
      });
      const json = await res.json();
      if (json.yield) {
        setYieldResult(json.yield);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    calculateYield();
  };

  const resetSession = () => {
    setSession(null);
    setMatrix(Array(9).fill(0));
    setCompletion(Array(9).fill(false));
    setResonance(1.0);
    setYieldResult(null);
    setPsychState("SCATTERED");
    setIntent("");
    startTimeRef.current = null;
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Lodge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session ? (
            <div className="space-y-3">
              <Input
                placeholder="Enter your intent..."
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") startSession();
                }}
              />
              <Button
                className="w-full"
                onClick={startSession}
                disabled={loading || !intent.trim()}
              >
                {loading ? "Starting..." : "Start Session"}
              </Button>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {session.intent}
                </p>
                <div className="flex items-center gap-2">
                  <ResonanceIndicator resonance={resonance} />
                  <span className="text-xs text-muted-foreground">
                    {psychState}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <WafqGrid
                  matrix={matrix}
                  completion={completion}
                  onCellToggle={handleCellToggle}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={endSession}
                  disabled={loading}
                >
                  End Session
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={resetSession}
                >
                  Reset
                </Button>
              </div>

              <YieldDisplay yieldResult={yieldResult} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
