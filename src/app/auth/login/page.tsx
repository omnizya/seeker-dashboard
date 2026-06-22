"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../actions";
import AuthLayout from "../_components/AuthLayout";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";
import AuthCard from "../_components/AuthCard";
import OAuthButtons from "../_components/OAuthButtons";
import { PasswordInput } from "../_components/PasswordInput";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  async function loginAction(_prevState: string | null, formData: FormData) {
    try {
      await login(formData);
      return null;
    } catch {
      return "حدث خطأ في تسجيل الدخول. يرجى التحقق من بريدك الإلكتروني وكلمة المرور.";
    }
  }

  const [error, formAction, isPending] = useActionState(loginAction, null);

  const leftPanelContent = (
    <div className="flex flex-col justify-between h-full">
      <LeftPanel />
      <div className="mt-8">
        <SocialProof />
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftPanel={leftPanelContent}
      rightPanel={
        <div className="space-y-6">
          <AuthCard
            title="تسجيل الدخول"
            subtitle="مرحباً بعودتك! سجل دخولك للمتابعة"
          >
            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@domain.com"
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>

              <PasswordInput
                showForgot={true}
                onForgotClick={() => router.push("/auth/request-reset")}
                disabled={isPending}
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ تسجيل الدخول...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          </AuthCard>

          <OAuthButtons mode="login" />

          <p className="text-center">
            <Link
              href="/auth/register"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ليس لديك حساب؟ سجل الآن
            </Link>
          </p>
        </div>
      }
    />
  );
}

export const dynamic = "force-dynamic";
