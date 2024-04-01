import { redirect } from "next/navigation";

import { createClient } from "~/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <main className="m-2 p-4">
      <header className="h-40 w-full"><h1>Dashboard</h1></header>
      <aside>navigation</aside>
      <section>
        <article>user profile</article>
        {data.user.email}
      </section>
    </main>
  );
}
