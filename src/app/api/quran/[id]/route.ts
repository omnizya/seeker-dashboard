import { NextRequest, NextResponse } from "next/server";
import Ayats from "~/data/ayats";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: any };
  }
) {
  const requestUrl = request.url;
  const idx = params.id;
  const result = Ayats.find(({ id }) => id === parseInt(idx));
  return NextResponse.json(result);
}
