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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

import { computePlanetaryHours, PlanetaryHour } from "~/utils/planetary-hours";
import { DefaultText } from "~/texts";

function toLocalTime(d: Date) {
  return d.toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function dateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PlanetaryHoursCard() {
  const geo = useGeolocation();
  const [hours, setHours] = useState<PlanetaryHour[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetching =
    !geo.loading && !geo.error && geo.latitude != null && geo.longitude != null && hours === null && error === null;

  const T = DefaultText.PlanetaryHours;

  useEffect(() => {
    if (
      geo.loading ||
      geo.error ||
      geo.latitude == null ||
      geo.longitude == null
    )
      return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    Promise.all([
      fetch(
        `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateParam(today)}`,
      ).then((r) => r.json()),
      fetch(
        `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateParam(tomorrow)}`,
      ).then((r) => r.json()),
    ])
      .then(([todayData, tomorrowData]) => {
        if (todayData.error) {
          setError(todayData.error);
          return;
        }
        if (tomorrowData.error) {
          const sunrise = new Date(todayData.results.sunrise);
          const sunset = new Date(todayData.results.sunset);
          const dayLen = todayData.results.day_length * 1000;
          const nextSunrise = new Date(sunset.getTime() + (86400000 - dayLen));
          const result = computePlanetaryHours(
            todayData.results.sunrise,
            todayData.results.sunset,
            nextSunrise.toISOString(),
            today,
          );
          setHours(result);
          return;
        }
        const result = computePlanetaryHours(
          todayData.results.sunrise,
          todayData.results.sunset,
          tomorrowData.results.sunrise,
          today,
        );
        setHours(result);
      })
      .catch((e) => setError(e.message));
  }, [geo.latitude, geo.longitude, geo.loading, geo.error]);

  if (geo.loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">{T.cardTitle}</CardTitle>
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
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">{T.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">يرجى تفعيل صلاحية الموقع لعرض الساعات الكوكبية</p>
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
            <CardTitle className="text-center">{T.cardTitle}</CardTitle>
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
      <div className="mx-auto max-w-2xl">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">{T.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hours) return null;

  const dayHours = hours.filter((h) => h.isDaytime);
  const nightHours = hours.filter((h) => !h.isDaytime);

  const planetColors: Record<string, string> = {
    Saturn: "bg-gray-500",
    Jupiter: "bg-blue-500",
    Mars: "bg-red-500",
    Sun: "bg-orange-500",
    Venus: "bg-green-500",
    Mercury: "bg-yellow-500",
    Moon: "bg-teal-500",
  };

  function renderTable(data: PlanetaryHour[]) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">الكوكب</TableHead>
            <TableHead className="text-center">البداية</TableHead>
            <TableHead className="text-center">النهاية</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((h) => (
            <TableRow key={h.hourIndex}>
              <TableCell className="text-center">
                <Badge className={`${planetColors[h.planet] || "bg-gray-500"} text-white`}>
                  {T.planets[h.planet]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{toLocalTime(h.start)}</TableCell>
              <TableCell className="text-center">{toLocalTime(h.end)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-center">{T.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="day">
            <TabsList className="w-full">
              <TabsTrigger value="day" className="flex-1">{T.dayLabel}</TabsTrigger>
              <TabsTrigger value="night" className="flex-1">{T.nightLabel}</TabsTrigger>
            </TabsList>
            <TabsContent value="day">{renderTable(dayHours)}</TabsContent>
            <TabsContent value="night">{renderTable(nightHours)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
