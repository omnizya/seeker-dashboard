"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Ayah } from "../../../types/app";
import { Badge } from "@chakra-ui/react";

function AyahComponent({ values }: { values: Ayah }) {
  return (
    <li className=" min-h-8 bg-slate-600 p-4 m-2 text-right ">
      <Link href="/dashboard/quran/[id]" as={`/dashboard/quran/${values?.id}`}>
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
  const [data, setData] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    let abortController = new AbortController();

    async function loadStream() {
      try {
        const res = await fetch("/api/quran", { signal: abortController.signal });
        if (!res.body) throw new Error("No readable stream");
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";
          
          const newAyahs = lines.filter(l => l.trim()).map(line => {
            const v = JSON.parse(line);
            return {
              id: v[0],
              ayah: v[1],
              grand_east: v[2],
              grand_west: v[3],
              small_east: v[4],
              small_west: v[5],
              nafsy: v[6]
            } as Ayah;
          });

          if (mounted && newAyahs.length > 0) {
            setData(prev => [...prev, ...newAyahs]);
          }
        }
        
        // Process any remaining buffer
        if (buffer.trim()) {
          const v = JSON.parse(buffer);
          const finalAyah = {
            id: v[0], ayah: v[1], grand_east: v[2], grand_west: v[3],
            small_east: v[4], small_west: v[5], nafsy: v[6]
          } as Ayah;
          if (mounted) setData(prev => [...prev, finalAyah]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          if (mounted) setError(err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadStream();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  if (error) return <div>Failed to load</div>;

  return (
    <ul className="min-h-10 max-h-300 overflow-y-auto max-w-[100ch] text-warning  bg-black">
      {isLoading && data.length === 0 && <div>Loading stream...</div>}
      {data.map((p: Ayah) => (
        <AyahComponent key={p.id} values={p} />
      ))}
    </ul>
  );
}
