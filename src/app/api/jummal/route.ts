import { NextRequest, NextResponse } from "next/server";
import { CalcJomal } from "~/utils";
import { CalcJomalT } from "~/types";

type JummalApiResponse =
  | {
      text?: string;
      grand?: {
        east: number;
        west: number;
      };
      small?: {
        east: number;
        west: number;
      };
      nafsy?: number;
      error?: string;
    }
  | undefined;

export async function GET(req: NextRequest) {
  let text = req.nextUrl.searchParams.get("text") ?? "";
  text = String(text);
  const result: CalcJomalT = CalcJomal(text);

  const output: JummalApiResponse = {
    text: text,
    grand: {
      east: result.ge,
      west: result.gw,
    },
    small: {
      east: result.se,
      west: result.sw,
    },
    nafsy: result.n,
  };

  return NextResponse.json(output);
}
