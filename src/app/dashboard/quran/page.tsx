"use client";
import Link from "next/link";
import useSWR from "swr";
import { Ayah } from "../../../types/app";
import { Badge, Divider } from "@chakra-ui/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AyahComponent({ values }: any) {
  return (
    <li className=" min-h-8 bg-slate-600 p-4 m-2 text-right ">
      <Link href="/quran/[id]" as={`/quran/${values?.id}`}>
        <Badge variant="outline" colorScheme="green">
          {values?.id}
        </Badge>

        <span className=" mr-4 font-uthman text-4xl">{values?.ayah}</span>
        <Badge colorScheme="green">{values?.grand_east}</Badge>
        <Badge colorScheme="red">{values?.grand_west}</Badge>
        <Badge>{values?.small_east}</Badge>
        <Badge>{values?.small_west}</Badge>
        <Badge colorScheme="yellow">{values?.nafsy}</Badge>
      </Link>
    </li>
  );
}

export default function Index() {
  const { data, error, isLoading } = useSWR("/api/quran/", fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <ul className="min-h-10 max-h-300 overflow-y-auto max-w-[100ch] text-warning  bg-black">
      {data.map((p: Ayah) => (
        <AyahComponent key={p.id} values={p} />
      ))}
    </ul>
  );
}
