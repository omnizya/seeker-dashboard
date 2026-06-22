"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { createClient } from "~/utils/supabase/client";
import AuthLayout from "../_components/AuthLayout";
import AuthCard from "../_components/AuthCard";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";

const OTP_LENGTH = 4;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  /* ─── Auto-focus first input on mount ─── */
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ─── OTP input handlers ─── */
  function handleChange(index: number, value: string) {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = [...otp];
    for (let i = 0; i < OTP_LENGTH; i++) {
      next[i] = pasted[i] ?? "";
    }
    setOtp(next);

    // Focus the next empty slot or the last input
    const targetIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[targetIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.some((d) => !d)) return;

    const emailFromStorage = sessionStorage.getItem("verify_email");
    if (!emailFromStorage) {
      setMessage({ type: "error", text: "البريد الإلكتروني غير متوفر" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: emailFromStorage,
      token: otp.join(""),
      type: "signup",
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "رمز التحقق غير صحيح" });
    } else {
      router.push("/auth/login");
    }
  }

  const leftPanelContent = (
    <div className="flex flex-col justify-between h-full">
      <LeftPanel />
      <div className="mt-8">
        <SocialProof />
      </div>
    </div>
  );

  const rightPanelContent = (
    <AuthCard
      title="تأكيد البريد الإلكتروني"
      subtitle="أدخل رمز التحقق المكون من 4 أرقام الذي أرسلناه إلى بريدك الإلكتروني"
      footer={
        <button
          type="button"
          onClick={() => {
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
          }}
          className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          إعادة إرسال الرمز
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <p className={`text-sm text-center ${message.type === "error" ? "text-destructive" : "text-green-500"}`}>
            {message.text}
          </p>
        )}
        {/* ─── OTP input group ─── */}
        <div className="flex justify-center gap-3 rtl:gap-3" dir="ltr">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={cn(
                "h-14 w-14 text-center text-xl font-bold",
                "transition-all duration-150",
                digit
                  ? "border-primary bg-primary/5"
                  : "border-border",
              )}
              autoComplete="one-time-code"
              required
              aria-label={`الرقم ${index + 1}`}
            />
          ))}
        </div>

        {/* ─── Submit ─── */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || otp.some((d) => !d)}
        >
          {loading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التحقق…
            </>
          ) : (
            "تأكيد"
          )}
        </Button>
      </form>
    </AuthCard>
  );

  return (
    <AuthLayout leftPanel={leftPanelContent} rightPanel={rightPanelContent} />
  );
}

export const dynamic = "force-dynamic";
