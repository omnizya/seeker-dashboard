"use client";

import { cn } from "~/lib/utils";

// Symbolic UI — planet colors are creative metaphors, not historical correspondences
const PLANET_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  SUN: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-500/15" },
  MOON: { dot: "bg-slate-300", text: "text-slate-600 dark:text-slate-300", bg: "bg-slate-300/15" },
  MARS: { dot: "bg-red-500", text: "text-red-700 dark:text-red-400", bg: "bg-red-500/15" },
  MERCURY: { dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-400/15" },
  JUPITER: { dot: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-500/15" },
  VENUS: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/15" },
  SATURN: { dot: "bg-amber-600", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-600/15" },
};

const PLANET_LABELS: Record<string, string> = {
  SUN: "الشمس",
  MOON: "القمر",
  MARS: "المريخ",
  MERCURY: "عطارد",
  JUPITER: "المشتري",
  VENUS: "الزهرة",
  SATURN: "زحل",
};

type PlanetName = keyof typeof PLANET_COLORS;

interface CelestialBadgeProps {
  planet: string;
}

export default function CelestialBadge({ planet }: CelestialBadgeProps) {
  const key = planet.toUpperCase() as PlanetName;
  const colors = PLANET_COLORS[key] ?? PLANET_COLORS.SUN;
  const label = PLANET_LABELS[key] ?? planet;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        colors.bg,
        colors.text
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}
