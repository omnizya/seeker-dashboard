"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";

type DuaEntry = {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  benefit: string | null;
  sort_order: number;
};

type DuaList = {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string | null;
  entries: DuaEntry[];
};

type DuaResponse = {
  lists: DuaList[];
};

const CATEGORIES: Record<string, string> = {
  all: "الكل",
  morning: "صباح",
  evening: "مساء",
  sleep: "نوم",
  wake_up: "استيقاظ",
  food: "طعام",
  travel: "سفر",
  prayer: "صلاة",
  ramadan: "رمضان",
  hajj: "حج",
  protection: "حماية",
  provision: "رزق",
  forgiveness: "مغفرة",
  custom: "مخصص",
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

export default function DuaPage() {
  const [data, setData] = useState<DuaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const params = activeCategory !== "all" ? `?category=${activeCategory}` : "";
    fetch(`/api/dua${params}`)
      .then((r) => {
        if (r.status === 401) throw new Error("يرجى تسجيل الدخول أولاً");
        return r.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [activeCategory]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">الأدعية والأذكار</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">الأدعية والأذكار</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lists = data?.lists || [];

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-center text-lg">الأدعية والأذكار</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="mb-6"
          >
            <TabsList className="flex-wrap">
              {CATEGORY_KEYS.map((key) => (
                <TabsTrigger key={key} value={key}>{CATEGORIES[key]}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {lists.length === 0 ? (
            <p className="text-center text-lg text-muted-foreground">
              لا توجد أدعية في هذا التصنيف
            </p>
          ) : (
            <div className="space-y-6">
              {lists.map((list) => (
                <Card key={list.id} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-right text-base">
                      {list.title}
                    </CardTitle>
                    {list.description && (
                      <p className="mt-1 text-right text-sm text-muted-foreground">
                        {list.description}
                      </p>
                    )}
                    {list.source && (
                      <Badge className="mt-2 w-fit bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                        {list.source}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Accordion type="multiple" className="w-full">
                      {list.entries.map((entry) => (
                        <AccordionItem
                          key={entry.id}
                          value={String(entry.id)}
                          className="border-none mb-2"
                        >
                          <AccordionTrigger className="rounded-md bg-teal-50 dark:bg-teal-900/30 px-4 py-3 [&[data-state=open]]:rounded-b-none">
                            <p
                              className="flex-1 text-right text-xl line-clamp-2"
                              style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                            >
                              {entry.arabic}
                            </p>
                          </AccordionTrigger>
                          <AccordionContent className="rounded-b-md bg-teal-50 dark:bg-teal-900/30 px-4 pb-4">
                            <div className="flex flex-col gap-3">
                              <p
                                className="text-right text-2xl leading-relaxed"
                                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                                dir="rtl"
                              >
                                {entry.arabic}
                              </p>
                              {entry.transliteration && (
                                <>
                                  <Separator />
                                  <p className="text-right text-base italic text-muted-foreground">
                                    {entry.transliteration}
                                  </p>
                                </>
                              )}
                              {entry.translation && (
                                <>
                                  <Separator />
                                  <p className="text-right text-base text-muted-foreground">
                                    {entry.translation}
                                  </p>
                                </>
                              )}
                              {entry.benefit && (
                                <div className="mt-2 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3">
                                  <p className="text-right text-sm">
                                    <strong>الفضل: </strong>
                                    {entry.benefit}
                                  </p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
