"use client";

import { cn } from "~/lib/utils";

interface WafqGridProps {
  matrix: number[];
  completion: boolean[];
  onCellToggle: (index: number) => void;
}

export default function WafqGrid({
  matrix,
  completion,
  onCellToggle,
}: WafqGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
      {matrix.map((value, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onCellToggle(i)}
          className={cn(
            "flex items-center justify-center h-14 w-14 rounded-md border font-mono text-lg font-bold transition-colors",
            completion[i]
              ? "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-400"
              : "bg-muted border-border hover:bg-accent"
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
