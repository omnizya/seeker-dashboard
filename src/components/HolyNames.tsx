"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Database } from "../types/supabase";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";

export type HolyNames = {
  id: number;
  holy_name: string;
  east: number;
  west: number;
};
export const HolyNames = () => {
  const supabase = createClientComponentClient<Database>();
  const [names, setNames] = useState<any>([]);
  useEffect(() => {
    const getNames = async () => {
      const { data, error } = await supabase.from("holy_names").select();
      if (error) throw error;
      setNames(data);
    };
    getNames();
  }, [supabase]);

  return (
    <Table className="lg:w-1/3">
      <TableCaption className="text-3xl">
        إحصاء أسماء الله الحسنى
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>الكلمة</TableHead>
          <TableHead className="text-left">عدد الحروف</TableHead>
          <TableHead className="text-left">الرقم</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {names.map((i: HolyNames, j: number) => (
          <TableRow key={i.id + j}>
            <TableCell className="w-min bg-zinc-500">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {i.holy_name}
              </Badge>
            </TableCell>
            <TableCell className="w-min text-lg">
              {i.holy_name.length}
            </TableCell>
            <TableCell className="text-left">
              <span className="w-3ch text-lg">{i.east}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
