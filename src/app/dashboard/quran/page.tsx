"use client";
import Link from "next/link";
import useSWR from "swr";
import { swrFetcher } from "~/lib/fetcher";
import type { Ayah } from "~/types/app";
import { Badge } from "~/components/ui/badge";

function AyahComponent({ values }: { values: Ayah }) {
  return (
    <li className="min-h-8 bg-slate-600 p-4 m-2 text-right">
      <Link href={`/dashboard/quran/${values?.id}`}>
        <Badge variant="outline" className="text-green-400 border-green-400">
          {values?.id}
        </Badge>

        <span className="mr-4 font-uthman text-4xl">{values?.ayah}</span>
        <Badge className="bg-green-600 text-white border-transparent">
          {values?.grand_east}
        </Badge>
        <Badge className="bg-red-600 text-white border-transparent">
          {values?.grand_west}
        </Badge>
        <Badge>{values?.small_east}</Badge>
        <Badge>{values?.small_west}</Badge>
        <Badge className="bg-yellow-500 text-white border-transparent">
          {values?.nafsy}
        </Badge>
      </Link>
    </li>
  );
}

export default function Index() {
  const { data, error, isLoading } = useSWR<Ayah[]>("/api/quran", swrFetcher);

  if (error) return <div className="text-center text-red-500 p-4">فشل التحميل</div>;

  return (
    <ul className="min-h-10 max-h-300 overflow-y-auto max-w-[100ch] text-warning bg-black">
      {isLoading && <div className="text-center p-4 text-muted-foreground">جاري تحميل البيانات…</div>}
      {data?.map((p: Ayah) => (
        <AyahComponent key={p.id} values={p} />
      ))}
    </ul>
  );
}
