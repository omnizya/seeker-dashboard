"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../_components/AuthLayout";
import WelcomeAchievement from "../_components/WelcomeAchievement";
import LeftPanel from "../_components/LeftPanel";

export default function WelcomePage() {
  const router = useRouter();

  const leftPanelContent = (
    <div className="flex flex-col justify-between h-full">
      <LeftPanel />
    </div>
  );

  const rightPanelContent = (
    <WelcomeAchievement
      onStartJourney={() => router.push("/dashboard")}
      onViewProfile={() => router.push("/dashboard/profile")}
    />
  );

  return (
    <AuthLayout leftPanel={leftPanelContent} rightPanel={rightPanelContent} />
  );
}

export const dynamic = "force-dynamic";
