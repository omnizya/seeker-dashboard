"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface AuthCardProps {
  /** Card heading text */
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Main form / content */
  children: React.ReactNode;
  /** Optional footer content (e.g. links, secondary actions) */
  footer?: React.ReactNode;
  /** Additional className for the card */
  className?: string;
}

/**
 * AuthCard — Wrapper for authentication forms.
 *
 * Uses the shadcn/ui `Card` component with a subtle top border accent in the
 * primary colour, a bold title, and an optional muted subtitle.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        "relative border-border/60 shadow-xl shadow-cosmic-950/50",
        // Top accent border
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-lg before:bg-gradient-to-r before:from-primary/40 before:via-primary before:to-primary/40",
        "overflow-hidden",
        className,
      )}
    >
      <CardHeader className="space-y-2 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-balance text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4">{children}</CardContent>
      {footer && (
        <CardFooter className="flex-col gap-2 border-t border-border/40 pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
