"use client";
import Link from "next/link";
import useSWR from "swr";
import { Ayah } from "../../../../types/app";
import { Badge, Divider } from "@chakra-ui/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AyahComponent({ ayah }: Partial<Ayah>) {
  return (
    <li className=" min-h-8 bg-slate-600 p-4 m-2 text-right ">
      <Link href="/quran/[id]" as={`/quran/${ayah?.id}`}>
        <Badge variant="outline" colorScheme="green">
          {ayah.id}
        </Badge>

        <span className=" mr-4 font-uthman text-4xl">{ayah?.ayah}</span>
        <Badge colorScheme="green">{ayah.grand_east}</Badge>
        <Badge colorScheme="red">{ayah.grand_west}</Badge>
        <Badge>{ayah.small_east}</Badge>
        <Badge>{ayah.small_west}</Badge>
        <Badge colorScheme="yellow">{ayah.nafsy}</Badge>
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
        <AyahComponent key={p.id} ayah={p} />
      ))}
    </ul>
  );
}
