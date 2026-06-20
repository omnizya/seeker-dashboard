import { NextRequest, NextResponse } from "next/server";
import Ayats from "~/data/ayats";
export async function GET(
  request: NextRequest,
  props: {
    params: Promise<{ id: any }>;
  }
) {
  const params = await props.params;
  const requestUrl = request.url;
  const idx = params.id;
  const result = Ayats.find(({ id }) => id === parseInt(idx));
  return NextResponse.json(result);
}
