import { redirect } from "next/navigation";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Textarea,
  User,
  Button
} from "@nextui-org/react";
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
        <article className="border  relative rounded-sm p-2 shadow-sm drop-shadow-2 w-1/2">
          <Card className="w-full p-4">
            <CardHeader className="flex gap-3 p-2">
              <Image
                alt="nextui logo"
                height={40}
                radius="sm"
                src="https://www.arabiccalligraphygenerator.com/image?name=%D8%A7%D9%84%D8%AC%D9%8F%D9%85%D9%91%D9%84&font=0"
                width={40}
              />
              <div className="flex flex-col m-2 p-2">
                <p className=" text-title-md">حساب الجُمَّل</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <Textarea
  
                placeholder="المرجو إدخال النص"
                className="w-full p-2 "
              />
            </CardBody>
            <Divider />
            <CardFooter className="mt-2">
            <Button size="lg">
            احسب
      </Button>  
            </CardFooter>
          </Card>
        </article>
        
      </section>
    </section>
  );
}
