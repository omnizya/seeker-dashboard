"use client";

import { useState, useRef } from "react";
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
import { api } from "~/lib/api";
import type { LodgeComputeResponse, LodgeValidateResponse } from "~/types/api";
import type { YieldResult } from "~/engine";

interface SessionState {
  userId: string;
  intent: string;
  seed: number;
  element: string;
  square: number[][];
  magicConstant: number;
}

export default function LodgePage() {
  const [intent, setIntent] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [matrix, setMatrix] = useState<number[]>(Array(9).fill(0));
  const [completion, setCompletion] = useState<boolean[]>(Array(9).fill(false));
  const [resonance, setResonance] = useState(1.0);
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startSession = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<LodgeComputeResponse>("/api/lodge/compute", {
        intent: intent.trim(),
      });
      setSession(data);
      const flat = data.square.flat();
      setMatrix(flat);
      setCompletion(Array(9).fill(true));
      setYieldResult(null);
      setResonance(1.0);
      startTimeRef.current = Date.now();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطأ في الشبكة");
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
      const data = await api.post<LodgeValidateResponse>(
        "/api/lodge/validate",
        { cells: toggledCells, completion: completionRatio },
      );
      if (data.valid) {
        setResonance((prev) => Math.min(prev + 0.1, 2.0));
      } else {
        setResonance((prev) => Math.max(prev - 0.1, 0.1));
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
      const data = await api.post<YieldResult>("/api/lodge/compute", {
        durationTicks,
        interruptions: interruptionCount,
        resonance: resonance >= 1.5,
      });
      setYieldResult(data);
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
    setIntent("");
    startTimeRef.current = null;
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>بروتوكول اللودج</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session ? (
            <div className="space-y-3">
              <Input
                placeholder="أدخل نيتك…"
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
                {loading ? "جاري بدء الجلسة…" : "بدء الجلسة"}
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
                  إنهاء الجلسة
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={resetSession}
                >
                  إعادة تعيين
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
