import { NextRequest, NextResponse } from "next/server";
import { computePlanetaryHours, type Planet } from "~/utils/planetary-hours";
import { fetchSunriseSunset, parseCoordinates } from "~/utils/sunrise";

type SerializedPlanetaryHour = {
  planet: Planet;
  start: string; // ISO string
  end: string; // ISO string
  isDaytime: boolean;
  hourIndex: number;
};

/**
 * GET /api/planetary-hours
 *
 * Query params (lat+lng+date or explicit times):
 *   lat=...&lng=...&date=YYYY-MM-DD
 *     → fetches sunrise/sunset automatically for the given coords + date
 *   sunrise=ISO&sunset=ISO&nextSunrise=ISO&date=YYYY-MM-DD
 *     → computes directly from explicit times
 */
export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date parameter (use YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const lat = request.nextUrl.searchParams.get("lat");
    const lng = request.nextUrl.searchParams.get("lng");
    const sunriseParam = request.nextUrl.searchParams.get("sunrise");
    const sunsetParam = request.nextUrl.searchParams.get("sunset");
    const nextSunriseParam = request.nextUrl.searchParams.get("nextSunrise");

    let sunriseISO: string;
    let sunsetISO: string;
    let nextSunriseISO: string;

    if (lat && lng) {
      // Fetch sunrise/sunset from coordinates
      const coords = parseCoordinates(lat, lng);
      if ("error" in coords) {
        return NextResponse.json(
          { error: coords.error },
          { status: coords.status },
        );
      }

      const dateStr = dateParam || "today";
      const tomorrow = new Date(targetDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

      const [todayData, tomorrowData] = await Promise.all([
        fetchSunriseSunset(coords.lat, coords.lng, dateStr),
        fetchSunriseSunset(coords.lat, coords.lng, tomorrowStr),
      ]);

      sunriseISO = todayData.results.sunrise;
      sunsetISO = todayData.results.sunset;
      nextSunriseISO = tomorrowData.results.sunrise;
    } else if (sunriseParam && sunsetParam && nextSunriseParam) {
      sunriseISO = sunriseParam;
      sunsetISO = sunsetParam;
      nextSunriseISO = nextSunriseParam;
    } else {
      return NextResponse.json(
        {
          error:
            "Provide either lat+lng or sunrise+sunset+nextSunrise parameters",
        },
        { status: 400 },
      );
    }

    const hours = computePlanetaryHours(
      sunriseISO,
      sunsetISO,
      nextSunriseISO,
      targetDate,
    );

    const serialized: SerializedPlanetaryHour[] = hours.map((h) => ({
      planet: h.planet,
      start: h.start.toISOString(),
      end: h.end.toISOString(),
      isDaytime: h.isDaytime,
      hourIndex: h.hourIndex,
    }));

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      dayRuler: hours.find((h) => h.hourIndex === 0)!.planet,
      hours: serialized,
    });
  } catch (error) {
    console.error("Planetary hours API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
