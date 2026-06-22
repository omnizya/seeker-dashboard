"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import AuthLayout from "../_components/AuthLayout";
import LeftPanel from "../_components/LeftPanel";
import SocialProof from "../_components/SocialProof";

export default function WelcomePage() {
  const leftPanelContent = (
    <div className="flex flex-col justify-between h-full">
      <LeftPanel />
      <div className="mt-8">
        <SocialProof />
      </div>
    </div>
  );

  const rightPanelContent = (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <span className="text-3xl">✦</span>
        </div>
        <CardTitle className="text-2xl">مرحباً بك في الباحث</CardTitle>
        <p className="text-sm text-muted-foreground">
          تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/auth/login">تسجيل الدخول</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">العودة إلى الصفحة الرئيسية</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <AuthLayout leftPanel={leftPanelContent} rightPanel={rightPanelContent} />
  );
}
