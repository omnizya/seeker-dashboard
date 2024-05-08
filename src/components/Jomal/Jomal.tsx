"use client";
import { useState } from "react";
import { CalcJomalT } from "../../../types";
import { CalcJomal } from "~/utils";

export default function Jomal() {
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
    setJomalValues(CalcJomal(event.target.name.value));
  };
  return (
    <article className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
      <div className="px-6 py-4">
        <div className="mb-2 text-xl font-bold">إسم</div>
        <form className="flex flex-col" dir="rtl" onSubmit={submitContact}>
          <label htmlFor="name" className="mb-2 italic">
            الإسم
          </label>
          <input
            className="mb-4 border-b-2 p-2 text-black text-lg font-satoshi"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
          >
            احسب
          </button>
        </form>
      </div>
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
  //  return <p>Hello {data.user.email}</p>
}
