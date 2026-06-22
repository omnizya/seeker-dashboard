"use client";

import { cn } from "~/lib/utils";
import type { YieldResult } from "~/engine";

interface YieldDisplayProps {
  yieldResult: YieldResult | null;
}

export default function YieldDisplay({ yieldResult }: YieldDisplayProps) {
  if (!yieldResult) {
    return (
      <div className="text-center text-muted-foreground text-sm py-4">
        No yield data yet
      </div>
    );
  }

  const rows = [
    { label: "Total Yield", value: yieldResult.totalYield.toFixed(2) },
    { label: "Flow Time", value: `${yieldResult.flowTime} ticks` },
    { label: "Interruptions", value: yieldResult.interruptions },
    {
      label: "Resonance",
      value: yieldResult.resonance ? "×1.5" : "×1.0",
    },
    { label: "Archetype", value: yieldResult.archetype },
  ];

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">{row.label}</span>
          <span
            className={cn(
              "font-mono font-medium",
              row.label === "Resonance" &&
                yieldResult.resonance &&
                "text-green-600 dark:text-green-400"
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
