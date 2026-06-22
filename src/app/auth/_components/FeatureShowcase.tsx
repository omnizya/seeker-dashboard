"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

/* ─── Feature data ─── */

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: "⚗",
    title: "الكيمياء",
    description: "حوّل المعرفة إلى حكمة",
  },
  {
    icon: "☿",
    title: "التنجيم",
    description: "اكتشف خريطة روحك",
  },
  {
    icon: "🪐",
    title: "الساعات الكوكبية",
    description: "اعمل بتناغم مع الدورات الفلكية",
  },
  {
    icon: "□",
    title: "المربعات السحرية",
    description: "تعلم الرموز والأنماط",
  },
  {
    icon: "🏆",
    title: "نظام التقدم",
    description: "اكسب XP وابنِ إتقانك",
  },
];

/* ─── Component ─── */

/**
 * FeatureShowcase — Compact feature highlights grid.
 *
 * Used on mobile (when the `LeftPanel` is hidden) or as a standalone
 * section in other contexts. Displays the same feature content as the
 * left panel but in a denser card grid format.
 *
 * - 3-column grid on desktop (md+).
 * - 2-column grid on mobile.
 */
export default function FeatureShowcase() {
  return (
    <div className="w-full">
      <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
        ميزات المنصة
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              "animate-fade-in rounded-xl border border-border/50 bg-card/50 p-3 text-center backdrop-blur-sm",
              "transition-colors duration-200 hover:border-primary/30",
            )}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
          >
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-lg mx-auto">
              {feature.icon}
            </span>
            <h3 className="text-xs font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
