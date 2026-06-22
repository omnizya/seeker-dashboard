import { redirect } from "next/navigation";
import JummalCard from "~/components/JummalCard/Jummal";
import GeoDataCard from "~/components/GeoDataCard";
import PlanetaryHoursCard from "~/components/PlanetaryHoursCard";
import ResonanceMatrixCard from "~/components/ResonanceMatrixCard";

import { createClient } from "~/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <section className="p-4 space-y-4">
      <GeoDataCard />
      <PlanetaryHoursCard />
      <JummalCard />
      <ResonanceMatrixCard />
    </section>
  );
}
