"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Check, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createClient } from "~/utils/supabase/client";
import AuthLayout from "../_components/AuthLayout";
import AuthCard from "../_components/AuthCard";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";

export default function RequestResetPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const leftPanelContent = (
    <div className="flex flex-col justify-between h-full">
      <LeftPanel />
      <div className="mt-8">
        <SocialProof />
      </div>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (!error) {
      setSubmitted(true);
    }
  }

  const rightPanelContent = (
    <AuthCard
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة كلمة المرور"
      footer={
        <Link
          href="/auth/login"
          className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-balance text-base leading-relaxed text-foreground">
            تم إرسال رابط الاستعادة إلى بريدك الإلكتروني
          </p>
          <p className="text-sm text-muted-foreground">
            يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات
          </p>
          <Link
            href="/auth/login"
            className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                placeholder="your-email@example.com"
                className="pr-10 text-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإرسال…
              </>
            ) : (
              "إرسال رابط الاستعادة"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );

  return (
    <AuthLayout leftPanel={leftPanelContent} rightPanel={rightPanelContent} />
  );
}

export const dynamic = "force-dynamic";
