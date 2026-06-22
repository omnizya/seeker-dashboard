"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { createClient } from "~/utils/supabase/client";
import AuthLayout from "../_components/AuthLayout";
import AuthCard from "../_components/AuthCard";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";
import { PasswordInput } from "../_components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error("حدث خطأ أثناء تعيين كلمة المرور");
    } else {
      toast.success("تم تعيين كلمة المرور الجديدة بنجاح");
      router.push("/auth/login");
    }
  }

  const rightPanelContent = (
    <AuthCard
      title="تعيين كلمة مرور جديدة"
      subtitle="اختر كلمة مرور قوية لحماية حسابك"
      footer={
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          العودة إلى تسجيل الدخول
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="كلمة المرور الجديدة"
          id="new-password"
          placeholder="أدخل كلمة المرور الجديدة"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showForgot={false}
          autoComplete="new-password"
        />

        <PasswordInput
          label="تأكيد كلمة المرور"
          id="confirm-password"
          placeholder="أعد إدخال كلمة المرور"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          showForgot={false}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التعيين…
            </>
          ) : (
            "تعيين كلمة المرور"
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
