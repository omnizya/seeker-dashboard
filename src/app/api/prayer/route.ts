import { NextRequest, NextResponse } from "next/server";
import {
  computePrayerTimes,
  PRAYER_METHODS,
  type PrayerMethod,
} from "~/utils/prayer-times";

// ---- Types -------------------------------------------------------

type PrayerApiTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type PrayerApiResponse = {
  date: string;
  method: string;
  location: { lat: number; lng: number };
  times: PrayerApiTimes;
  angles: { fajr: number; isha: number };
};

type PrayerApiError = {
  error: string;
};

// ---- Helpers -----------------------------------------------------

/** Parse a latitude or longitude string to a number. Returns null on failure. */
function parseCoord(value: string | null, label: string): number | null {
  if (!value) return null;
  const n = Number(value);
  if (isNaN(n)) return null;
  return n;
}

/** Format a Date as YYYY-MM-DD. */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---- GET Handler -------------------------------------------------

/**
 * GET /api/prayer
 *
 * Compute Islamic prayer times for a given date + location + method.
 *
 * Query params:
 *   lat       — latitude in decimal degrees (required)
 *   lng       — longitude in decimal degrees (required)
 *   date      — YYYY-MM-DD (optional, defaults to today)
 *   method    — prayer method key (optional, defaults to "MWL")
 *               One of: MWL, ISNA, Egypt, UmmAlQura, Dubai, Kuwait,
 *                       Qatar, Tehran, Other
 *   tzone     — timezone UTC offset in hours (optional, defaults to 0)
 *   asrMethod — "standard" or "hanafi" (optional, defaults to "standard")
 *   fajrAngle — custom Fajr angle override for "Other" method (optional)
 *   ishaAngle — custom Isha angle override for "Other" method (optional)
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PrayerApiResponse | PrayerApiError>> {
  try {
    const params = request.nextUrl.searchParams;

    // ---- Parse & validate lat -----------------------------------
    const lat = parseCoord(params.get("lat"), "lat");
    if (lat === null || lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: "Invalid or missing 'lat' parameter (±90)" },
        { status: 400 },
      );
    }

    // ---- Parse & validate lng -----------------------------------
    const lng = parseCoord(params.get("lng"), "lng");
    if (lng === null || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid or missing 'lng' parameter (±180)" },
        { status: 400 },
      );
    }

    // ---- Parse date ---------------------------------------------
    const dateStr = params.get("date");
    let targetDate: Date;
    if (dateStr) {
      targetDate = new Date(dateStr + "T00:00:00");
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          {
            error:
              "Invalid 'date' parameter — use YYYY-MM-DD format (e.g. 2026-06-21)",
          },
          { status: 400 },
        );
      }
    } else {
      targetDate = new Date();
    }

    // ---- Parse method -------------------------------------------
    const methodKey = params.get("method") || "MWL";
    let method: PrayerMethod;

    if (methodKey in PRAYER_METHODS) {
      method = { ...PRAYER_METHODS[methodKey] };

      // Allow angle overrides via query params
      const fajrOverride = params.get("fajrAngle");
      const ishaOverride = params.get("ishaAngle");

      if (fajrOverride !== null) {
        const fa = Number(fajrOverride);
        if (!isNaN(fa) && fa > 0 && fa < 90) {
          method = { ...method, fajrAngle: fa };
        } else {
          return NextResponse.json(
            { error: "Invalid 'fajrAngle' parameter (0 < angle < 90)" },
            { status: 400 },
          );
        }
      }

      if (ishaOverride !== null) {
        const ia = Number(ishaOverride);
        if (!isNaN(ia) && ia > 0 && ia < 90) {
          method = { ...method, ishaAngle: ia };
        } else {
          return NextResponse.json(
            { error: "Invalid 'ishaAngle' parameter (0 < angle < 90)" },
            { status: 400 },
          );
        }
      }
    } else {
      return NextResponse.json(
        {
          error: `Unknown method '${methodKey}'. Available: ${Object.keys(PRAYER_METHODS).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ---- Parse timezone -----------------------------------------
    const tzoneParam = params.get("tzone");
    const timezone = tzoneParam !== null ? Number(tzoneParam) : 0;
    if (isNaN(timezone) || timezone < -12 || timezone > 14) {
      return NextResponse.json(
        { error: "Invalid 'tzone' parameter (−12 … +14)" },
        { status: 400 },
      );
    }

    // ---- Parse Asr method ---------------------------------------
    const asrParam = params.get("asrMethod") || "standard";
    if (asrParam !== "standard" && asrParam !== "hanafi") {
      return NextResponse.json(
        {
          error:
            "Invalid 'asrMethod' parameter — use 'standard' or 'hanafi'",
        },
        { status: 400 },
      );
    }

    // ---- Compute ------------------------------------------------
    const times = computePrayerTimes(
      targetDate,
      lat,
      lng,
      timezone,
      method,
      asrParam,
    );

    // ---- Serialize ----------------------------------------------
    const response: PrayerApiResponse = {
      date: formatDate(targetDate),
      method: methodKey,
      location: { lat, lng },
      times: {
        fajr: times.fajr.toISOString(),
        sunrise: times.sunrise.toISOString(),
        dhuhr: times.dhuhr.toISOString(),
        asr: times.asr.toISOString(),
        maghrib: times.maghrib.toISOString(),
        isha: times.isha.toISOString(),
      },
      angles: {
        fajr: times.fajrAngle,
        isha: times.ishaAngle,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Prayer times error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
