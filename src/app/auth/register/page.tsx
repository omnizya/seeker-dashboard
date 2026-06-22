"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "~/stores/authStore";
import AuthLayout from "../_components/AuthLayout";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";
import AuthCard from "../_components/AuthCard";
import { PasswordInput } from "../_components/PasswordInput";
import Stepper, { type Step } from "../_components/Stepper";
import InterestCard from "../_components/InterestCard";
import GoalCard from "../_components/GoalCard";
import AvatarUpload from "../_components/AvatarUpload";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

const STEPS: Step[] = [
  { id: 1, label: "الحساب" },
  { id: 2, label: "الاهتمامات" },
  { id: 3, label: "الأهداف" },
  { id: 4, label: "الملف الشخصي" },
];

const INTEREST_OPTIONS = [
  { title: "التنجيم", icon: "🌙" },
  { title: "الكيمياء", icon: "🧪" },
  { title: "الساعات الكوكبية", icon: "🪐" },
  { title: "المربعات السحرية", icon: "🔲" },
  { title: "الهندسة المقدسة", icon: "✡️" },
  { title: "التأمل", icon: "🧘" },
  { title: "التاروت", icon: "🃏" },
  { title: "الهرمسية", icon: "📜" },
  { title: "القابالة", icon: "🌳" },
];

const GOAL_OPTIONS = [
  { title: "التعلم", icon: "📚" },
  { title: "الممارسة", icon: "🔮" },
  { title: "البحث", icon: "🔬" },
  { title: "التطوير الذاتي", icon: "🌱" },
  { title: "الانضباط الروحاني", icon: "🕯️" },
  { title: "المجتمع", icon: "👥" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, setError } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(),
  );
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const toggleInterest = (title: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 0:
        if (!email || !email.includes("@")) {
          setError("يرجى إدخال بريد إلكتروني صحيح");
          return false;
        }
        if (!password || password.length < 6) {
          setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return false;
        }
        if (password !== confirmPassword) {
          setError("كلمة المرور غير متطابقة");
          return false;
        }
        if (!agreedToTerms) {
          setError("يجب الموافقة على شروط الاستخدام");
          return false;
        }
        return true;
      case 1:
        if (selectedInterests.size === 0) {
          setError("يرجى اختيار اهتمام واحد على الأقل");
          return false;
        }
        return true;
      case 2:
        if (!selectedGoal) {
          setError("يرجى اختيار هدف واحد");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;

    const result = await register({
      email,
      password,
      confirmPassword,
      displayName: displayName || "User",
      interests: Array.from(selectedInterests),
    });

    if (result.success) {
      router.push("/auth/welcome");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                required
                autoComplete="email"
              />
            </div>
            <PasswordInput
              label="كلمة المرور"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="تأكيد كلمة المرور"
              id="confirmPassword"
              name="confirmPassword"
              showForgot={false}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked === true)
                }
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                أوافق على{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  سياسة الخصوصية
                </Link>
              </Label>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INTEREST_OPTIONS.map((interest) => (
              <InterestCard
                key={interest.title}
                title={interest.title}
                icon={interest.icon}
                selected={selectedInterests.has(interest.title)}
                onToggle={() => toggleInterest(interest.title)}
              />
            ))}
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GOAL_OPTIONS.map((goal) => (
              <GoalCard
                key={goal.title}
                title={goal.title}
                icon={goal.icon}
                selected={selectedGoal === goal.title}
                onSelect={() => setSelectedGoal(goal.title)}
              />
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <AvatarUpload value={avatar} onChange={setAvatar} />
            <div className="space-y-2">
              <Label htmlFor="displayName">اسم العرض</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="الباحث"
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                يُستخدم تاريخ الميلاد والموقع فقط لحسابات الأبراج. لا نشارك
                هذه البيانات.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-between">
          <LeftPanel />
          <div className="mt-8">
            <SocialProof />
          </div>
        </div>
      }
      rightPanel={
        <AuthCard
          title="إنشاء حساب جديد"
          subtitle="انضم إلى رحلة المعرفة الروحانية"
          footer={
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب؟{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                سجل الدخول
              </Link>
            </p>
          }
        >
          <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" />

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="mt-6 flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  السابق
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  التالي
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="gold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    "بدء الرحلة"
                  )}
                </Button>
              )}
            </div>
          </form>
        </AuthCard>
      }
    />
  );
}

export const dynamic = "force-dynamic";
