"use client";
import Link from "next/link";
import useSWR from "swr";
import { Ayah } from "../../../types/app";
import { Badge, Divider } from "@chakra-ui/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AyahComponent({ inputData }: Partial<Ayah>) {
  return (
    <li className=" min-h-8 bg-slate-600 p-4 m-2 text-right ">
      <Link href="/quran/[id]" as={`/quran/${inputData?.id}`}>
        <Badge variant="outline" colorScheme="green">
          {inputData?.id}
        </Badge>

        <span className=" mr-4 font-uthman text-4xl">{inputData?.ayah}</span>
        <Badge colorScheme="green">{inputData?.grand_east}</Badge>
        <Badge colorScheme="red">{inputData?.grand_west}</Badge>
        <Badge>{inputData?.small_east}</Badge>
        <Badge>{inputData?.small_west}</Badge>
        <Badge colorScheme="yellow">{inputData?.nafsy}</Badge>
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
        <AyahComponent key={p.id} inputData={p} />
      ))}
    </ul>
  );
}
