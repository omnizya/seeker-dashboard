"use client";

import { useState, useMemo, useEffect } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import useSWR from "swr";
import { swrFetcher } from "~/lib/fetcher";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type PrayerResponse = {
  date: string;
  method: string;
  location: { lat: number; lng: number };
  times: PrayerTimes;
  angles: { fajr: number; isha: number };
};

const PRAYER_NAMES: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const METHODS: Record<string, string> = {
  MWL: "رابطة العالم الإسلامي",
  ISNA: "الجمعية الإسلامية لأمريكا الشمالية",
  Egypt: "الهيئة المصرية العامة للمساحة",
  UmmAlQura: "أم القرى",
  Karachi: "جامعة العلوم الإسلامية بكراتشي",
  Tehran: "طهران",
  Jafari: "الجعفري",
};

function toLocalTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function getHijriDate(): string {
  const d = new Date();
  const ref = new Date(2026, 5, 21);
  const diff = Math.floor(
    (d.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24),
  );
  const hijriRef = { year: 1447, month: 11, day: 5 };
  let day = hijriRef.day + diff;
  let month = hijriRef.month;
  let year = hijriRef.year;
  const monthDays = [
    30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29,
  ];
  while (day > monthDays[month % 12]) {
    day -= monthDays[month % 12];
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  while (day < 1) {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    day += monthDays[month % 12];
  }

  const monthNames = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الآخر",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ];

  return `${day} ${monthNames[month % 12]} ${year}هـ`;
}

function findCurrentPrayer(
  times: PrayerTimes,
): { key: string; index: number } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const entries: { key: string; minutes: number }[] = [];

  for (const [key, iso] of Object.entries(times)) {
    const d = new Date(iso);
    const mins = d.getHours() * 60 + d.getMinutes();
    entries.push({ key, minutes: mins });
  }

  entries.sort((a, b) => a.minutes - b.minutes);

  for (let i = 0; i < entries.length; i++) {
    if (entries[i].minutes >= currentMinutes) {
      return { key: entries[i].key, index: i };
    }
  }

  return { key: entries[0].key, index: 0 };
}

const prayerKeys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

export default function PrayerPage() {
  const geo = useGeolocation();
  const [method, setMethod] = useState<string>("MWL");
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const shouldFetch =
    !geo.loading &&
    !geo.error &&
    geo.latitude != null &&
    geo.longitude != null;

  const { data, error, isLoading } = useSWR<PrayerResponse>(
    shouldFetch
      ? `/api/prayer?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateStr}&method=${method}`
      : null,
    swrFetcher,
  );

  useEffect(() => {
    if (!data?.times) return;

    const found = findCurrentPrayer(data.times);
    setCurrentPrayer(found?.key ?? null);

    const interval = setInterval(() => {
      const found = findCurrentPrayer(data.times);
      setCurrentPrayer(found?.key ?? null);
    }, 60000);

    return () => clearInterval(interval);
  }, [data]);

  if (geo.loading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الصلاة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (geo.error) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الصلاة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">يرجى تفعيل صلاحية الموقع لعرض البيانات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الصلاة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
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
            <CardTitle className="text-center">أوقات الصلاة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="space-y-4">
        <Card className="w-full p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">أوقات الصلاة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {getHijriDate()} — {dateStr}
              </p>
              <Select
                value={method}
                onValueChange={(value) => {
                  setMethod(value);
                }}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METHODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {prayerKeys.map((key) => {
            const time = data.times[key as keyof PrayerTimes];
            const isCurrent = currentPrayer === key;

            return (
              <Card
                key={key}
                className={`p-4 ${isCurrent ? "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900" : ""}`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  {isCurrent && (
                    <Badge className="bg-green-500 text-white text-xs">
                      الحالي
                    </Badge>
                  )}
                  <p className="text-lg font-bold">{PRAYER_NAMES[key]}</p>
                  <p className="text-3xl font-bold" dir="ltr">
                    {toLocalTime(time)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
