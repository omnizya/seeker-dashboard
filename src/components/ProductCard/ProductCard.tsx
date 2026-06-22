"use client";

import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";

const IMAGE =
  "https://images.unsplash.com/photo-1518051870910-a46e30d9db16?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80";

export default function ProductSimple() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card
        role="group"
        className="relative z-10 max-w-[330px] w-full bg-white dark:bg-gray-800 shadow-2xl hover:scale-105 transition-transform"
      >
        <div className="relative mt-[-3rem] h-[230px] rounded-lg group-hover:after:blur-[20px] after:transition-all after:duration-300 after:content-[''] after:absolute after:inset-0 after:top-5 after:left-0 after:w-full after:h-full after:bg-cover after:bg-no-repeat after:blur-[15px] after:-z-10">
          <Image
            className="rounded-lg h-[230px] w-[282px] object-cover"
            src={IMAGE}
            alt="#"
          />
        </div>
        <CardContent className="pt-10 flex flex-col items-center">
          <span className="text-sm text-gray-500 uppercase">Brand</span>
          <h2 className="text-2xl font-medium">Nice Chair, pink</h2>
          <div className="flex items-center">
            <span className="text-xl font-extrabold">$57</span>
            <span className="line-through text-gray-600 ml-2">$199</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
