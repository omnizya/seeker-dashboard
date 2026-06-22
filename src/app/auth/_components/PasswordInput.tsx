"use client";

import * as React from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

/* ─── Eye / EyeOff icons (inline SVG for no extra deps) ─── */

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

/* ─── Props ─── */

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Label text (default: "كلمة المرور") */
  label?: string;
  /** Show a "نسيت كلمة المرور؟" link below the input */
  showForgot?: boolean;
  /** Called when the forgot-password link is clicked */
  onForgotClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/* ─── Component ─── */

/**
 * PasswordInput — Password field with show/hide toggle and optional
 * "Forgot password?" link.
 *
 * Uses the shadcn/ui `Input` component and toggles between `password`
 * and `text` input types. The visibility toggle and (optional) forgot
 * link are purely presentational — supply your own handler for
 * `onForgotClick` if needed.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id = "password",
      label = "كلمة المرور",
      showForgot = true,
      onForgotClick,
      className,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className={cn("space-y-2", className)}>
        {/* ─── Label row ─── */}
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
        </div>

        {/* ─── Input wrapper ─── */}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            name="password"
            type={visible ? "text" : "password"}
            autoComplete={visible ? "off" : "current-password"}
            className="pe-10" // right padding for the toggle button
            {...props}
          />
          {/* Toggle visibility */}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={cn(
              "absolute inset-y-0 flex items-center justify-center px-3",
              "text-muted-foreground transition-colors hover:text-foreground",
              // RTL-aware: in RTL `left-0` is visually the right side
              "left-0",
            )}
            aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOffIcon className="h-[18px] w-[18px]" />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>

        {/* ─── Forgot password link ─── */}
        {showForgot && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onForgotClick}
              className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
