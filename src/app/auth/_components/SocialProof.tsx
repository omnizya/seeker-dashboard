"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

/* ─── Stat data ─── */

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "50,000+", label: "درس مكتمل" },
  { value: "12,000+", label: "ممارس نشط" },
  { value: "200+", label: "مسار تعليمي" },
];

/* ─── Component ─── */

/**
 * SocialProof — Stats section rendered at the bottom of the auth left panel.
 *
 * Displays three key metrics in a grid layout with gold-highlighted numbers
 * and a subtle count-up animation on mount.
 */
export default function SocialProof() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "animate-count-up text-center",
            )}
            style={{
              animationDelay: `${index * 200}ms`,
              animationFillMode: "both",
            }}
          >
            <p className="font-uthman text-2xl font-bold text-gold-400 sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
