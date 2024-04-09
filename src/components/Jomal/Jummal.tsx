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
            onChange={submitContact}
          />
        </CardBody>
        <Divider />
        <CardFooter className="mt-2">
          {/*       <Button size="lg">
          احسب
    </Button>   */}
        </CardFooter>
      </Card>
      <div className=" min-w-full bg-zinc-400 text-black text-center">
        <h2 className="w-full bg-zinc-700 text-zinc-50 text-title-xl">
          الحصيلة
        </h2>
        <table className=" border-collapse border border-slate-500 table-auto w-full">
          <thead className=" table-header-group">
            <tr>
              <td className="border border-slate-600">مشرقي</td>
              <td className="border border-slate-600">مغربي</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-700">
                {jomalValues.east.base} | {jomalValues.east.reduced}
              </td>
              <td className="border border-slate-700">
                {jomalValues.west.base} | {jomalValues.east.reduced}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
