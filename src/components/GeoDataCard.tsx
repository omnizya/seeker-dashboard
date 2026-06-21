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

type SunriseResult = {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: number;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
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

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function GeoDataCard() {
  const geo = useGeolocation();
  const [data, setData] = useState<SunriseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetching =
    !geo.loading && !geo.error && geo.latitude != null && geo.longitude != null && data === null && error === null;

  useEffect(() => {
    if (geo.loading || geo.error || geo.latitude == null || geo.longitude == null)
      return;

    fetch(
      `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.results);
        }
      })
      .catch((e) => setError(e.message));
  }, [geo.latitude, geo.longitude, geo.loading, geo.error]);

  if (geo.loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الشمس</CardTitle>
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
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الشمس</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">يرجى تفعيل صلاحية الموقع لعرض أوقات الشمس</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الشمس</CardTitle>
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
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">أوقات الشمس</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-center">أوقات الشمس</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">الشروق</p>
              <p className="text-lg font-bold">{toLocalTime(data.sunrise)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الغروب</p>
              <p className="text-lg font-bold">{toLocalTime(data.sunset)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">منتصف النهار</p>
              <p className="text-lg font-bold">{toLocalTime(data.solar_noon)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">طول النهار</p>
              <p className="text-lg font-bold">{formatDuration(data.day_length)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بداية الشفق المدني</p>
              <p className="text-lg font-bold">{toLocalTime(data.civil_twilight_begin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نهاية الشفق المدني</p>
              <p className="text-lg font-bold">{toLocalTime(data.civil_twilight_end)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بداية الشفق البحري</p>
              <p className="text-lg font-bold">{toLocalTime(data.nautical_twilight_begin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نهاية الشفق البحري</p>
              <p className="text-lg font-bold">{toLocalTime(data.nautical_twilight_end)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بداية الشفق الفلكي</p>
              <p className="text-lg font-bold">{toLocalTime(data.astronomical_twilight_begin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نهاية الشفق الفلكي</p>
              <p className="text-lg font-bold">{toLocalTime(data.astronomical_twilight_end)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
