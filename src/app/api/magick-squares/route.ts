import { NextRequest, NextResponse } from "next/server";
import {
  Elementals,
  Square,
  magicConstant,
} from "~/utils/magick-squares";

type SquareApiResponse = {
  elemental: Elementals;
  input: number;
  square: number[];
  magicConstant: number;
};

/** GET /api/magick-squares?elemental=aero&input=1 */
export async function GET(request: NextRequest) {
  try {
    const elementalParam = request.nextUrl.searchParams.get("elemental");
    const inputParam = request.nextUrl.searchParams.get("input");

    if (!elementalParam || !inputParam) {
      return NextResponse.json(
        { error: "elemental and input query parameters are required" },
        { status: 400 },
      );
    }

    // Validate elemental
    const elemental = Object.values(Elementals).find(
      (e) => e === elementalParam,
    );
    if (!elemental) {
      return NextResponse.json(
        {
          error: `Invalid elemental. Must be one of: ${Object.values(Elementals).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate input
    const input = parseInt(inputParam, 10);
    if (isNaN(input)) {
      return NextResponse.json(
        { error: "input must be a valid integer" },
        { status: 400 },
      );
    }

    const square = Square(elemental, input);
    const constant = magicConstant(input);

    const response: SquareApiResponse = {
      elemental,
      input,
      square,
      magicConstant: constant,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Magick squares API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
