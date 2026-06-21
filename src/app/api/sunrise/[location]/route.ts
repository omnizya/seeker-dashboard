import { NextRequest, NextResponse } from "next/server";
import {
  fetchSunriseSunset,
  type GeocodingResult,
} from "~/utils/sunrise";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ location: string }> },
) {
  try {
    const params = await props.params;
    const location = decodeURIComponent(params.location).trim();

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 },
      );
    }

    // Geocode location to coordinates via Nominatim (OpenStreetMap)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "SeekerDashboard/1.0 (Islamic spiritual platform)",
          Accept: "application/json",
        },
      },
    );

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Failed to geocode location" },
        { status: 502 },
      );
    }

    const geoData: GeocodingResult[] = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return NextResponse.json(
        { error: `Location not found: "${location}"` },
        { status: 404 },
      );
    }

    const { lat, lon, display_name } = geoData[0];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "Invalid coordinates from geocoding" },
        { status: 502 },
      );
    }

    const sunData = await fetchSunriseSunset(latNum, lngNum);

    return NextResponse.json({
      location: display_name,
      coordinates: { lat: latNum, lng: lngNum },
      sunrise: sunData.results.sunrise,
      sunset: sunData.results.sunset,
      solar_noon: sunData.results.solar_noon,
      day_length: sunData.results.day_length,
      civil_twilight_begin: sunData.results.civil_twilight_begin,
      civil_twilight_end: sunData.results.civil_twilight_end,
      tzid: sunData.tzid,
    });
  } catch (error) {
    console.error("Location sunrise API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
