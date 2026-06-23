"use client";

import { useEffect, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type SunData = {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length_seconds: number;
};

type MoonData = {
  phase: string;
  illumination: number;
  age: number;
  next_new_moon: string;
  next_full_moon: string;
};

type QiblaData = {
  bearing: number;
  distance_km: number;
  kaaba_lat: number;
  kaaba_lng: number;
};

type AstroResponse = {
  date: string;
  location: { lat: number; lng: number };
  sun: SunData;
  moon: MoonData;
  qibla: QiblaData;
};

const MOON_PHASES: Record<string, string> = {
  new_moon: "محاق",
  waxing_crescent: "هلال متزايد",
  first_quarter: "تربيع أول",
  waxing_gibbous: "أحدب متزايد",
  full_moon: "بدر",
  waning_gibbous: "أحدب متناقص",
  third_quarter: "تربيع ثاني",
  waning_crescent: "هلال متناقص",
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

function toLocalDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}س ${m}د`;
}

function QiblaCompass({ bearing }: { bearing: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[120px] w-[120px]">
        <div className="absolute inset-0 rounded-full border-3 border-gray-300 dark:border-gray-600" />
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-xs font-bold">ش</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold">ج</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold">غ</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold">م</span>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl leading-none"
          style={{ transform: `translate(-50%, -50%) rotate(${bearing - 180}deg)` }}
        >
          🕋
        </div>
      </div>
      <p className="text-lg font-bold">
        {bearing.toFixed(1)}° درجة من الشمال
      </p>
    </div>
  );
}

function MoonPhaseIcon({ phase }: { phase: string }) {
  const icons: Record<string, string> = {
    new_moon: "🌑",
    waxing_crescent: "🌒",
    first_quarter: "🌓",
    waxing_gibbous: "🌔",
    full_moon: "🌕",
    waning_gibbous: "🌖",
    third_quarter: "🌗",
    waning_crescent: "🌘",
  };
  return (
    <p className="text-center text-5xl">
      {icons[phase] || "🌙"}
    </p>
  );
}

export default function AstroPage() {
  const geo = useGeolocation();
  const [data, setData] = useState<AstroResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const isFetching =
    !geo.loading &&
    !geo.error &&
    geo.latitude != null &&
    geo.longitude != null &&
    data === null &&
    error === null;

  useEffect(() => {
    if (geo.loading || geo.error || geo.latitude == null || geo.longitude == null)
      return;

    const controller = new AbortController();

    fetch(
      `/api/astro?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateStr}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });

    return () => controller.abort();
  }, [geo.latitude, geo.longitude, geo.loading, geo.error, dateStr]);

  if (geo.loading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">البيانات الفلكية واتجاه القبلة</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
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
            <CardTitle className="text-center">البيانات الفلكية واتجاه القبلة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">يرجى تفعيل صلاحية الموقع لعرض البيانات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">البيانات الفلكية واتجاه القبلة</CardTitle>
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
            <CardTitle className="text-center">البيانات الفلكية واتجاه القبلة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { qibla, moon, sun } = data;

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="space-y-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">اتجاه القبلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <QiblaCompass bearing={qibla.bearing} />
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">المسافة</p>
                  <p className="text-lg font-bold">{qibla.distance_km.toLocaleString("ar")} كم</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">خط عرض الكعبة</p>
                  <p className="text-lg font-bold">{qibla.kaaba_lat.toFixed(2)}°</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">خط طول الكعبة</p>
                  <p className="text-lg font-bold">{qibla.kaaba_lng.toFixed(2)}°</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">مراحل القمر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <MoonPhaseIcon phase={moon.phase} />
              <p className="text-2xl font-bold">
                {MOON_PHASES[moon.phase] || moon.phase}
              </p>
              <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">الإضاءة</p>
                  <p className="text-lg font-bold">{(moon.illumination * 100).toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">عمر القمر</p>
                  <p className="text-lg font-bold">{moon.age.toFixed(1)} يوم</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">المحاق القادم</p>
                  <p className="text-sm font-bold">
                    {toLocalDate(moon.next_new_moon)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">البدر القادم</p>
                  <p className="text-sm font-bold">
                    {toLocalDate(moon.next_full_moon)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {moon.age.toFixed(1)} يوم من المحاق
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">بيانات الشمس</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">الشروق</p>
                <p className="text-lg font-bold">{toLocalTime(sun.sunrise)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">الغروب</p>
                <p className="text-lg font-bold">{toLocalTime(sun.sunset)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">منتصف النهار</p>
                <p className="text-lg font-bold">{toLocalTime(sun.solar_noon)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">طول النهار</p>
                <p className="text-lg font-bold">
                  {formatDuration(sun.day_length_seconds)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
