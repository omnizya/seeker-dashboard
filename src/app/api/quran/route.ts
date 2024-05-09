import { NextRequest, NextResponse } from "next/server";
import Ayats from "~/data/ayats";

export async function GET(request: NextRequest) {
  const requestUrl = request.url;

  return NextResponse.json(Ayats);
}
