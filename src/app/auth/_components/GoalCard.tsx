"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface GoalCardProps {
  title: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export default function GoalCard({
  title,
  icon,
  selected,
  onSelect,
  className,
}: GoalCardProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none",
        "flex flex-col items-center gap-2 text-center",
        "border-border bg-card",
        selected && "border-gold bg-gold/10 shadow-lg shadow-gold/10",
        "hover:border-gold/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {selected && (
        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-gold-foreground">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}
      <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/5 text-2xl">
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
}
