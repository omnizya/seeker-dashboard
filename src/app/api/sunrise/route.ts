import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.url;
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const result = fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=1&date=today`
  ).then((res) => res.json());
  return NextResponse.json(result);
}
