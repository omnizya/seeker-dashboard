"use client";

import { cn } from "~/lib/utils";

interface ResonanceIndicatorProps {
  resonance: number;
}

export default function ResonanceIndicator({
  resonance,
}: ResonanceIndicatorProps) {
  const isResonant = resonance === 1.5;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        isResonant
          ? "bg-green-500/15 text-green-700 dark:text-green-400 animate-pulse"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isResonant ? "bg-green-500" : "bg-muted-foreground/40"
        )}
      />
      {isResonant ? "×1.5" : "×1.0"}
    </div>
  );
}
