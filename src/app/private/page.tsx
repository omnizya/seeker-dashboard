import { redirect } from "next/navigation";

import Jomal from "~/components/Jomal/Jomal";

import { createClient } from "~/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  
  return (
    <article className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
      <Jomal />
    </article>
  );
  //  return <p>Hello {data.user.email}</p>
}
