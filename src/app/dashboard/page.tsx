"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/stores/authStore";
import JummalCard from "~/components/JummalCard/Jummal";
import GeoDataCard from "~/components/GeoDataCard";
import PlanetaryHoursCard from "~/components/PlanetaryHoursCard";
import ResonanceMatrixCard from "~/components/ResonanceMatrixCard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;

  return (
    <section className="p-4 space-y-4">
      <GeoDataCard />
      <PlanetaryHoursCard />
      <JummalCard />
      <ResonanceMatrixCard />
    </section>
  );
}
