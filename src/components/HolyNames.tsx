"use client";

import useSWR from "swr";
import { swrFetcher } from "~/lib/fetcher";
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

export type HolyName = {
  id: number;
  holy_name: string;
  east: number;
  west: number;
};

type HolyNamesResponse = {
  holy_names: HolyName[];
};

export const HolyNames = () => {
  const { data, error, isLoading } = useSWR<HolyNamesResponse>(
    "/api/holy-names",
    swrFetcher,
  );

  const names = data?.holy_names ?? [];

  return (
    <Table className="lg:w-1/3">
      <TableCaption className="text-3xl">
        إحصاء أسماء الله الحسنى
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-start">الكلمة</TableHead>
          <TableHead className="text-end">عدد الحروف</TableHead>
          <TableHead className="text-end">الرقم</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              جاري التحميل...
            </TableCell>
          </TableRow>
        )}
        {error && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-red-500">
              {error instanceof Error ? error.message : "حدث خطأ"}
            </TableCell>
          </TableRow>
        )}
        {names.map((i, j) => (
          <TableRow key={i.id + j}>
            <TableCell className="w-min bg-zinc-500">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {i.holy_name}
              </Badge>
            </TableCell>
            <TableCell className="w-min text-lg">
              {i.holy_name.length}
            </TableCell>
            <TableCell className="text-end">
              <span className="w-3ch text-lg">{i.east}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
