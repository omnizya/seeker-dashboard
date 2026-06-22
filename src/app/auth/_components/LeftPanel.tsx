"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

/* ─── Feature data ─── */

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
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
 * LeftPanel — Inspirational content shown on the left (branded) side of
 * the auth split-screen layout.
 *
 * Renders the platform heading, a mission statement, and feature highlight
 * cards with staggered fade-in animation.
 */
export default function LeftPanel() {
  return (
    <div className="flex h-full flex-col justify-center">
      {/* ─── Brand heading ─── */}
      <div className="mb-8 space-y-2">
        <h1
          className={cn(
            "font-uthman text-4xl leading-tight tracking-wide sm:text-5xl",
            "text-gold-400",
          )}
        >
          حكمة قديمة.
        </h1>
        <h1
          className={cn(
            "font-uthman text-4xl leading-tight tracking-wide sm:text-5xl",
            "text-gold-400",
          )}
        >
          إتقان حديث.
        </h1>
      </div>

      {/* ─── Mission statement ─── */}
      <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        المنصة المتكاملة للعلوم الروحانية تجمع بين الحكمة الخالدة والتقنية
        الحديثة. اكتشف أسرار الكيمياء والتنجيم والساعات الكوكبية في رحلة
        معرفية فريدة.
      </p>

      {/* ─── Feature cards ─── */}
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              "animate-fade-in flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm",
              "transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06]",
            )}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
              {feature.icon}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
