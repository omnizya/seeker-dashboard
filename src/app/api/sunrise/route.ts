import { NextRequest, NextResponse } from "next/server";

type SunriseSunsetResult = {
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

type SunriseSunsetApiResponse = {
  results: SunriseSunsetResult;
  status: "OK";
  tzid: string;
};

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get("lat");
    const lng = request.nextUrl.searchParams.get("lng");
    const date = request.nextUrl.searchParams.get("date") || "today";

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng query parameters are required" },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "lat and lng must be valid numbers" },
        { status: 400 }
      );
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { error: "lat (-90 to 90) or lng (-180 to 180) out of range" },
        { status: 400 }
      );
    }

    const externalRes = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${latNum}&lng=${lngNum}&formatted=0&date=${date}`
    );

    if (!externalRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch sunrise/sunset data" },
        { status: 502 }
      );
    }

    const data: SunriseSunsetApiResponse = await externalRes.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: "External API returned non-OK status" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Sunrise/Sunset API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
