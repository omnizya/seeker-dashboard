"use client";

import { useState } from "react";
import { Textarea } from "@chakra-ui/react";
import { CalcJomalT } from "../../../types";
import { CalcJomal } from "~/utils";
import { Card, CardHeader, CardBody, CardFooter } from "@chakra-ui/react";
import { track } from "@vercel/analytics/react";
import { DefaultText } from "../../../texts";
export default function JummalCard() {
  const [jomalValues, setJomalValues] = useState<CalcJomalT>({
    ge: 0,
    gw: 0,
    se: 0,
    sw: 0,
    n: 0,
  });
  const submitContact = async (event: any) => {
    let inputValue = event.target.value;
    event.preventDefault();
    track("CalcJummal", { input: inputValue });
    setJomalValues(CalcJomal(inputValue));
  };
  return (
    <article className="border  relative rounded-sm p-2 shadow-sm drop-shadow-2  w-full font-uthman">
      <Card className="w-full p-4">
        <CardHeader className="flex gap-3 p-2">
          <div className="flex flex-col m-2 p-2">
            <p className=" text-title-xxl2">
              {DefaultText.JummalCard.cardTitle}
            </p>
          </div>
        </CardHeader>
        <hr />
        <CardBody>
          <Textarea
            placeholder={DefaultText.JummalCard.textAreaPlaceholder}
            className="w-full p-2 h-20 text-title-md"
            isRequired
            onChange={submitContact}
          />
        </CardBody>
      </Card>
      <hr />

      <div className=" mt-4 min-w-full bg-zinc-400 text-black text-center rounded-md border-transparent">
        <h2 className="w-full bg-zinc-700 text-zinc-50 text-title-xxl2 p-4">
          {DefaultText.JummalCard.outputTable.title}
        </h2>
        <table className=" border-collapse border border-slate-500 table-auto w-full">
          <thead className=" table-header-group">
            <tr>
              <td className="border border-slate-600 p-2 text-title-md">
                {DefaultText.JummalCard.outputTable.tableHeader.east}
              </td>
              <td className="border border-slate-600  p-2 text-title-md">
                {DefaultText.JummalCard.outputTable.tableHeader.west}
              </td>
              <td className="border border-slate-600  p-2 text-title-md">
                {DefaultText.JummalCard.outputTable.tableHeader.nafsy}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-700 text-2xl text-blue-700 font-semibold">
                {jomalValues.ge} <hr /> {jomalValues.se}
              </td>
              <td className="border border-slate-700 text-2xl text-rose-900 font-semibold">
                {jomalValues.gw} <hr /> {jomalValues.sw}
              </td>
              <td className="border border-slate-700 text-2xl text-rose-900 font-semibold">
                {jomalValues.n}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
