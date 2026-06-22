"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface InterestCardProps {
  /** Display label */
  title: string;
  /** Emoji / icon string */
  icon: string;
  /** Whether this card is currently selected */
  selected: boolean;
  /** Called when the card is toggled */
  onToggle: () => void;
  /** Additional className */
  className?: string;
}

/**
 * InterestCard — A selectable card used for choosing interests / topics
 * during onboarding.
 *
 * - Border toggles between `border-border` and `border-primary`.
 * - Background toggles between `bg-card` and `bg-primary/10`.
 * - Selected state adds a subtle gold shadow glow.
 * - Includes a check-mark circle in the top-right (RTL-aware) when selected.
 * - Keyboard accessible: role="checkbox" with Enter/Space support.
 */
export default function InterestCard({
  title,
  icon,
  selected,
  onToggle,
  className,
}: InterestCardProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none",
        "flex flex-col items-center gap-2 text-center",
        // Default state
        "border-border bg-card",
        // Selected state
        selected &&
          "border-primary bg-primary/10 shadow-lg shadow-primary/10",
        // Hover
        "hover:border-primary/50",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {/* ─── Check mark (top-right in RTL) ─── */}
      {selected && (
        <div
          className={cn(
            "absolute top-2 flex h-6 w-6 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground",
            // RTL: left corresponds to visual right
            "left-2",
          )}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}

      {/* ─── Icon ─── */}
      <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-2xl">
        {icon}
      </span>

      {/* ─── Title ─── */}
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
}
