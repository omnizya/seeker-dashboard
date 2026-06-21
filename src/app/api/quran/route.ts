import { NextRequest, NextResponse } from "next/server";
import { DATA_PATH } from "~/data/ayats";
import fs from "fs";

export async function GET(request: NextRequest) {
  const stream = fs.createReadStream(DATA_PATH);
  
  const readableStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Content-Encoding": "gzip",
    },
  });
}
