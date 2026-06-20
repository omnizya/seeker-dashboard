import { NextRequest, NextResponse } from "next/server";
import { CalcJomal, CalcJomalOutput } from "~/utils";

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

export async function GET(
  req: NextRequest,
  props: {
    params: Promise<{
      text: string;
    }>;
  }
) {
  const params = await props.params;
  let { text } = params;
  text = String(text);
  const result: CalcJomalOutput = CalcJomal(text);

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
