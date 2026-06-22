"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import { Toaster } from "~/components/ui/sonner";
import { useTasbihStore } from "~/stores/tasbihStore";

type ActivePreset = {
  id: number;
  name: string;
  dhikr: string;
  target: number;
};

const COMPLETION_STYLES = `
@keyframes tasbihComplete {
  0% { transform: scale(1); opacity: 0; }
  20% { transform: scale(1.2); opacity: 1; }
  40% { transform: scale(0.95); opacity: 1; }
  60% { transform: scale(1.05); opacity: 1; }
  80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
}
.tasbih-complete {
  animation: tasbihComplete 0.8s ease-in-out;
}
.confetti-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: confettiFall 1.5s ease-in forwards;
}
`;

function Confetti({ count = 20 }: { count?: number }) {
  const particles = useMemo(() => {
    const colors = [
      "#48BB78",
      "#4299E1",
      "#ED8936",
      "#9F7AEA",
      "#F56565",
      "#ECC94B",
      "#38B2AC",
    ];
    return Array.from({ length: count }, (_, i) => {
      const left = ((i * 37 + 13) % 100);
      const delay = ((i * 7) % 10) / 20;
      const color = colors[i % colors.length];
      const size = 4 + ((i * 3) % 7);
      return (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${left}%`,
            top: 0,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            animationDelay: `${delay}s`,
          }}
        />
      );
    });
  }, [count]);

  return (
    <div className="relative h-[120px] w-full overflow-hidden">
      {particles}
    </div>
  );
}

export default function TasbihPage() {
  const { presets, totalCount, loading, error: storeError, fetchPresets, addSession } = useTasbihStore();
  const [activePreset, setActivePreset] = useState<ActivePreset | null>(null);
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const activePresetRef = useRef<ActivePreset | null>(null);

  useEffect(() => {
    activePresetRef.current = activePreset;
    if (activePreset) {
      startTimeRef.current = Date.now();
    }
  }, [activePreset, sessionTick]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const startDhikr = (preset: ActivePreset) => {
    setActivePreset(preset);
    setCount(0);
    setIsCompleted(false);
    setShowConfetti(false);
  };

  const saveSession = async () => {
    const preset = activePresetRef.current;
    if (!preset || !startTimeRef.current) return;
    const duration = Math.floor((new Date().getTime() - startTimeRef.current) / 1000);
    setSaving(true);
    const result = await addSession({
      preset_id: preset.id,
      count: preset.target,
    });
    if (result.success) {
      toast.success("تم الحفظ", { duration: 2000 });
    }
    setSaving(false);
  }

  function increment() {
    if (isCompleted) return;
    setCount((prev) => {
      const next = prev + 1;
      if (activePreset && next >= activePreset.target) {
        setTimeout(() => {
          setIsCompleted(true);
          setShowConfetti(true);
          saveSession();
        }, 50);
      }
      return next;
    });
  }

  function resetCount() {
    setCount(0);
    setIsCompleted(false);
    setShowConfetti(false);
    setSessionTick((t) => t + 1);
  }

  function backToPresets() {
    setActivePreset(null);
    setCount(0);
    setIsCompleted(false);
    setShowConfetti(false);
    startTimeRef.current = null;
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (activePreset && !saving && !isCompleted && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        increment();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="mx-auto max-w-xl py-4">
      <style>{COMPLETION_STYLES}</style>
      <Toaster />
      <div className="space-y-4">
        <Card className="w-full p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">المسبحة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">
                  مجموع التسبيح اليوم
                </p>
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : storeError ? (
                  <p className="text-lg font-bold text-red-500">0</p>
                ) : (
                  <p className="text-3xl font-bold text-green-500">
                    {totalCount.toLocaleString("ar")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!activePreset ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <CardContent>
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : storeError ? (
              <p className="col-span-2 text-center text-red-500">{storeError}</p>
            ) : (
              presets.map((preset) => (
                <Card
                  key={preset.id}
                  className="cursor-pointer p-3 transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => startDhikr(preset)}
                >
                  <CardContent>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-2xl font-bold">{preset.dhikr}</p>
                      <p className="text-sm text-muted-foreground">{preset.name}</p>
                      <Badge className="bg-purple-500 text-white text-xs">
                        {preset.target}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card className="w-full p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={backToPresets}
                >
                  ✕
                </Button>
                <CardTitle className="text-center flex-1">
                  {activePreset.dhikr}
                </CardTitle>
                <div className="w-10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <p className="text-sm text-muted-foreground">
                  {activePreset.name}
                </p>

                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm">{count}</p>
                    <p className="text-sm">{activePreset.target}</p>
                  </div>
                  <Progress
                    value={(count / activePreset.target) * 100}
                    className="h-3"
                  />
                </div>

                <div className={`text-center ${isCompleted ? "tasbih-complete" : ""}`}>
                  <p
                    className={`text-7xl font-bold ${isCompleted ? "text-green-500" : ""}`}
                    dir="ltr"
                    style={{ fontFamily: "monospace" }}
                  >
                    {count.toLocaleString("ar")}
                  </p>
                </div>

                {showConfetti && <Confetti />}

                {isCompleted && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-bold text-green-500">
                      تم التسبيح
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activePreset.dhikr}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {activePreset.target} مرة
                    </p>
                  </div>
                )}

                <div className="flex w-full max-w-xs flex-col gap-3">
                  <Button
                    className="w-full h-20 text-3xl font-bold rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    onClick={increment}
                    disabled={isCompleted}
                  >
                    {isCompleted ? "✓" : count + 1}
                  </Button>

                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetCount}
                    >
                      إعادة
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={backToPresets}
                    >
                      اختيار ذكر آخر
                    </Button>
                  </div>
                </div>

                {!isCompleted && (
                  <p className="text-xs text-muted-foreground/60">
                    اضغط مسافة أو Enter للعد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
