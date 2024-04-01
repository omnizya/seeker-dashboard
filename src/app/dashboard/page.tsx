import { redirect } from "next/navigation";

import { createClient } from "~/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return <h1>Dashboard</h1>;
}
