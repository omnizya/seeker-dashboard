"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Textarea,
} from "@nextui-org/react";
import { useState } from "react";
import { CalcJomalT } from "~/types";
import { CalcJomal } from "~/utils";

export default function JummalCard() {
  const [jomalValues, setJomalValues] = useState<CalcJomalT>({
    east: {
      base: 0,
      reduced: 0,
    },
    west: {
      base: 0,
      reduced: 0,
    },
  });
  const submitContact = async (event: any) => {
    event.preventDefault();
    console.log(event.target.value)
    setJomalValues(CalcJomal(event.target.value));
  };
  return (
    <article className="border  relative rounded-sm p-2 shadow-sm drop-shadow-2  w-full font-uthman">
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
            <p className=" text-title-xxl2">حساب الجُمَّل</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Textarea
            placeholder="المرجو إدخال النص"
            className="w-full p-2 h-20 text-title-md"
            onChange={submitContact}
          />
        </CardBody>
   
      </Card>
      <Divider />

      <div className=" mt-4 min-w-full bg-zinc-400 text-black text-center rounded-md border-transparent">
        <h2 className="w-full bg-zinc-700 text-zinc-50 text-title-xxl2 p-4">
          الحصيلة
        </h2>
        <table className=" border-collapse border border-slate-500 table-auto w-full">
          <thead className=" table-header-group">
            <tr>
              <td className="border border-slate-600 p-2 text-title-md">مشرقي</td>
              <td className="border border-slate-600  p-2 text-title-md">مغربي</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-700 text-2xl text-blue-700 font-semibold">
                {jomalValues.east.base}  <Divider /> {jomalValues.east.reduced}
              </td>
              <td className="border border-slate-700 text-2xl text-rose-900 font-semibold">
                {jomalValues.west.base}  <Divider /> {jomalValues.east.reduced}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
