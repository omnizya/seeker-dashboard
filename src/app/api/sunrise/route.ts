import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      lat: any;
      lng: any;
    };
  }
) {
  const requestUrl = request.url;
  const lat = params.lat;
  const lng = params.lng;
  const result = fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=1&date=today`
  ).then((res) => res.json());
  return NextResponse.json(result);
}
