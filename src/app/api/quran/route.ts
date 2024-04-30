import { NextRequest, NextResponse } from "next/server";
import Ayats from "~/data/ayats";
import { Ayah } from "../../../../types/app";
import { paginate } from "~/utils";

export async function GET(request: NextRequest) {
  const requestUrl = request.url;

  return NextResponse.json(Ayats);
}
