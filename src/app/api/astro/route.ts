import { NextRequest, NextResponse } from "next/server";
import {
  computeSunData,
  computeMoonPhase,
  computeQibla,
} from "~/utils/astro";

export async function GET(request: NextRequest) {
  try {
    const latParam = request.nextUrl.searchParams.get("lat");
    const lngParam = request.nextUrl.searchParams.get("lng");
    const dateParam =
      request.nextUrl.searchParams.get("date") ||
      new Date().toISOString().slice(0, 10);

    // Validate lat
    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "lat and lng query parameters are required" },
        { status: 400 },
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "lat and lng must be valid numbers" },
        { status: 400 },
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          error:
            "lat (-90 to 90) or lng (-180 to 180) out of range",
        },
        { status: 400 },
      );
    }

    // Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateParam)) {
      return NextResponse.json(
        { error: "date must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    const dateObj = new Date(dateParam + "T00:00:00Z");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 },
      );
    }

    const sun = computeSunData(dateObj, lat, lng);
    const moon = computeMoonPhase(dateObj);
    const qibla = computeQibla(lat, lng);

    return NextResponse.json({
      date: dateParam,
      location: { lat, lng },
      sun: {
        sunrise: sun.sunrise.toISOString(),
        sunset: sun.sunset.toISOString(),
        solar_noon: sun.solar_noon.toISOString(),
        day_length_seconds: sun.day_length_seconds,
      },
      moon: {
        phase: moon.phase,
        illumination: moon.illumination,
        age: moon.age,
        distance_km: moon.distance_km,
        next_new_moon: moon.next_new_moon.toISOString(),
        next_full_moon: moon.next_full_moon.toISOString(),
      },
      qibla: {
        bearing: qibla.bearing,
        distance_km: qibla.distance_km,
        kaaba_lat: qibla.kaaba_lat,
        kaaba_lng: qibla.kaaba_lng,
      },
    });
  } catch (error) {
    console.error("Astro API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
