"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface AuthLayoutProps {
  /** Left panel content (inspirational / branding) */
  leftPanel: React.ReactNode;
  /** Right panel content (auth forms) */
  rightPanel: React.ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * AuthLayout — Split-screen layout for authentication pages.
 *
 * - **Desktop (lg+):** side-by-side, left 55% / right 45%.
 * - **Mobile:** single column, only the right panel is visible.
 * - Left panel has a fixed dark gradient background with subtle
 *   decorative elements (radial glow + slow-spinning geometric ring).
 * - Both panels respect the `dir="rtl"` context of the app.
 */
export default function AuthLayout({
  leftPanel,
  rightPanel,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen",
        // RTL-aware: in RTL, the flex direction is row by default,
        // so left panel still renders first in DOM order.
        className,
      )}
    >
      {/* ─── Left Panel — hidden on mobile ─── */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-[55%] lg:flex-col">
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-cosmic-950 via-cosmic-950/95 to-background">
          {/* Decorative radial gradient circle */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
          />

          {/* Decorative slow-spinning geometric ring */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              className="animate-spin-slow text-primary/5"
              width="480"
              height="480"
              viewBox="0 0 480 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="240"
                cy="240"
                r="200"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="8 8"
              />
              <circle
                cx="240"
                cy="240"
                r="160"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="4 12"
              />
              <circle
                cx="240"
                cy="240"
                r="120"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2 6"
              />
              <polygon
                points="240,80 280,180 380,180 300,240 330,340 240,280 150,340 180,240 100,180 200,180"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Second glow from bottom-right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-gold-500/5 blur-[100px]"
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-12">
            {leftPanel}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — full width on mobile, scrollable ─── */}
      <div
        className={cn(
          "flex min-h-screen w-full flex-col",
          "lg:mr-[55%] lg:w-[45%]", // push right of left panel
        )}
      >
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">{rightPanel}</div>
        </div>
      </div>
    </div>
  );
}
