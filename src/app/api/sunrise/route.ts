import { NextRequest, NextResponse } from "next/server";
import { fetchSunriseSunset, parseCoordinates } from "~/utils/sunrise";

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get("lat");
    const lng = request.nextUrl.searchParams.get("lng");
    const date = request.nextUrl.searchParams.get("date") || "today";

    const coords = parseCoordinates(lat, lng);
    if ("error" in coords) {
      return NextResponse.json(
        { error: coords.error },
        { status: coords.status },
      );
    }

    const data = await fetchSunriseSunset(coords.lat, coords.lng, date);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sunrise/Sunset API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
