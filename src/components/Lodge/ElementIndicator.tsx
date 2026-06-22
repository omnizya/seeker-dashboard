"use client";

import { cn } from "~/lib/utils";

// Symbolic UI — element colors are creative metaphors, not historical correspondences
const ELEMENT_MAP: Record<number, { name: string; dot: string; text: string; bg: string }> = {
  0: { name: "الأرض", dot: "bg-amber-700", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-700/15" },
  1: { name: "الماء", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/15" },
  2: { name: "الهواء", dot: "bg-cyan-400", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-400/15" },
  3: { name: "النار", dot: "bg-red-500", text: "text-red-700 dark:text-red-400", bg: "bg-red-500/15" },
};

interface ElementIndicatorProps {
  element: number;
}

export default function ElementIndicator({ element }: ElementIndicatorProps) {
  const info = ELEMENT_MAP[element] ?? ELEMENT_MAP[0];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        info.bg,
        info.text
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", info.dot)} />
      {info.name}
    </span>
  );
}
