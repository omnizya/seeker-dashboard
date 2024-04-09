import { redirect } from "next/navigation";
import JummalCard from "~/components/Jomal/Jummal";

import { createClient } from "~/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <section className=" p-4">
      <header className="h-40 w-full">
        <h1>Dashboard</h1>
      </header>
      <aside>
      </aside>
      <section>

        <JummalCard />
      </section>
    </section>
  );
}
