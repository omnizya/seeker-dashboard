"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  /** Ordered list of steps */
  steps: Step[];
  /** Index of the currently-active step (0-based) */
  currentStep: number;
  /** Additional className */
  className?: string;
}

/**
 * Stepper — Multi-step progress indicator.
 *
 * Renders a horizontal row of numbered circles connected by lines.
 * - **Completed:** filled with `bg-primary`, shows a checkmark icon.
 * - **Active:** `border-primary` with a subtle glow ring.
 * - **Pending:** `bg-muted` with muted text.
 *
 * Transitions are smooth via `duration-300`.
 */
export default function Stepper({
  steps,
  currentStep,
  className,
}: StepperProps) {
  return (
    <nav aria-label="التقدم في الخطوات" className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* ─── Step circle ─── */}
              <li className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground shadow-sm",
                    isActive &&
                      "border-2 border-primary bg-card text-primary shadow-[0_0_12px_-2px_hsl(var(--primary)/0.4)]",
                    isPending && "bg-muted text-muted-foreground",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* ─── Label ─── */}
                <span
                  className={cn(
                    "mr-2 text-sm font-medium transition-colors duration-300",
                    isActive && "text-foreground",
                    isCompleted && "text-primary",
                    isPending && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </li>

              {/* ─── Connector line ─── */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
