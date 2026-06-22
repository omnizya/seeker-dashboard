"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Trophy, Star, Sparkles } from "lucide-react";

interface WelcomeAchievementProps {
  /** Honorific title for the user (default: "ساعي" — "Seeker") */
  seekerTitle?: string;
  /** Called when the user clicks "ابدأ الرحلة" */
  onStartJourney?: () => void;
  /** Called when the user clicks "عرض الملف الشخصي" */
  onViewProfile?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * WelcomeAchievement — Post-registration achievement card.
 *
 * Displayed after a user completes sign-up to celebrate their first step
 * and show the rewards they've earned.
 *
 * - Large gold-bordered card with a glow animation.
 * - Trophy icon at the top.
 * - "مرحباً أيها الساعي" heading.
 * - Rewards list (XP, level, first achievement badge).
 * - Two CTAs: primary "ابدأ الرحلة" and outline "عرض الملف الشخصي".
 */
export default function WelcomeAchievement({
  seekerTitle = "ساعي",
  onStartJourney,
  onViewProfile,
  className,
}: WelcomeAchievementProps) {
  return (
    <Card
      className={cn(
        "animate-fade-in relative overflow-hidden border-gold-400/30 p-8 text-center animate-pulse-glow",
        "bg-gradient-to-b from-card to-cosmic-950/60",
        className,
      )}
    >
      {/* ─── Decorative glow ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.08)_0%,_transparent_70%)]"
      />

      <div className="relative z-10 space-y-6">
        {/* ─── Trophy ─── */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-400/10">
          <Trophy className="h-10 w-10 text-gold-400" />
        </div>

        {/* ─── Heading ─── */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            مرحباً أيها {seekerTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            لقد اتخذت خطوتك الأولى في رحلة المعرفة
          </p>
        </div>

        {/* ─── Stars separator ─── */}
        <div className="flex items-center justify-center gap-2 text-gold-400/50">
          <Star className="h-3 w-3" />
          <Star className="h-4 w-4" />
          <Star className="h-3 w-3" />
        </div>

        {/* ─── Rewards list ─── */}
        <div className="space-y-3">
          {/* Level badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/80">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>المستوى 1</span>
          </div>

          {/* XP badge */}
          <Badge
            variant="outline"
            className="border-gold-400/20 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-400"
          >
            <Sparkles className="ml-1.5 h-3.5 w-3.5" />
            100 XP
          </Badge>

          {/* Achievement badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/80">
            <Trophy className="h-4 w-4 text-gold-400" />
            <span>أول إنجاز: First Step Taken</span>
          </div>
        </div>

        {/* ─── CTAs ─── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={onStartJourney}
            className="w-full sm:w-auto"
          >
            ابدأ الرحلة
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onViewProfile}
            className="w-full border-border sm:w-auto"
          >
            عرض الملف الشخصي
          </Button>
        </div>
      </div>
    </Card>
  );
}
