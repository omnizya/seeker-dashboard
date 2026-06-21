// ================================================================
// PRAYER TIMES COMPUTATION
// Pure TS solar astronomy for Islamic prayer times.
// Based on standard trigonometric formulas matching
// the spiritual.compute_prayer_times() PL/pgSQL function.
// ================================================================

// ---- Types ------------------------------------------------------

export interface PrayerTimes {
  /** Dawn — when the sun reaches fajrAngle° below the horizon */
  fajr: Date;
  /** Sunrise — sun at -0.833° altitude (atmospheric refraction) */
  sunrise: Date;
  /** Noon — solar culmination */
  dhuhr: Date;
  /** Afternoon — shadow reaches object height (×1 standard, ×2 Hanafi) */
  asr: Date;
  /** Sunset — same altitude as sunrise */
  maghrib: Date;
  /** Night — when the sun reaches ishaAngle° below the horizon */
  isha: Date;
  /** The Fajr angle used for this computation */
  fajrAngle: number;
  /** The Isha angle used for this computation */
  ishaAngle: number;
}

export interface PrayerMethod {
  /** Human-readable label (e.g. "Muslim World League") */
  label: string;
  /** Fajr angle in degrees below the horizon */
  fajrAngle: number;
  /** Isha angle in degrees below the horizon (null if interval-based) */
  ishaAngle: number | null;
  /**
   * Minutes after Maghrib for Isha.
   * When set, Isha is computed as Maghrib + interval instead of
   * using the hour-angle formula with ishaAngle.
   */
  ishaIntervalMinutes: number | null;
}

// ---- Prayer Methods ---------------------------------------------

/**
 * Standard prayer calculation methods matching the
 * `spiritual.prayer_methods` table in the SQL schema.
 *
 * Each method defines the solar-depression angles for Fajr and Isha.
 * Some methods (UmmAlQura, Qatar) use a fixed minute-interval from
 * Maghrib instead of an angle for Isha.
 */
export const PRAYER_METHODS: Record<string, PrayerMethod> = {
  MWL: {
    label: "Muslim World League",
    fajrAngle: 18,
    ishaAngle: 17,
    ishaIntervalMinutes: null,
  },
  ISNA: {
    label: "Islamic Society of North America",
    fajrAngle: 15,
    ishaAngle: 15,
    ishaIntervalMinutes: null,
  },
  Egypt: {
    label: "Egyptian General Authority",
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    ishaIntervalMinutes: null,
  },
  UmmAlQura: {
    label: "Umm al-Qura, Makkah",
    fajrAngle: 18.5,
    ishaAngle: null,
    ishaIntervalMinutes: 90,
  },
  Dubai: {
    label: "Dubai",
    fajrAngle: 18.2,
    ishaAngle: 18.2,
    ishaIntervalMinutes: null,
  },
  Kuwait: {
    label: "Kuwait",
    fajrAngle: 18,
    ishaAngle: 17.5,
    ishaIntervalMinutes: null,
  },
  Qatar: {
    label: "Qatar",
    fajrAngle: 18,
    ishaAngle: null,
    ishaIntervalMinutes: 90,
  },
  Tehran: {
    label: "Tehran",
    fajrAngle: 17.7,
    ishaAngle: 14,
    ishaIntervalMinutes: null,
  },
  Other: {
    label: "Custom",
    fajrAngle: 18,
    ishaAngle: 17,
    ishaIntervalMinutes: null,
  },
};

// ---- Angle Helpers ----------------------------------------------

/** Convert degrees to radians. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees. */
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ---- Solar Position Helpers -------------------------------------

/**
 * Compute the day of the year (1–366) for a given date.
 *
 * Used as input to the solar declination and equation-of-time
 * approximations, which are functions of the day number.
 */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0); // Dec 31 of previous year
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Approximate solar declination for a given day of the year.
 *
 * Formula: δ = 23.44° × sin(360/365 × (doy − 81))
 *
 * This is a sinusoidal approximation that models the Earth's axial
 * tilt (~23.44°).  The (doy − 81) term centres the peak at the
 * vernal equinox (day 81 = March 22).
 *
 * @param doy Day of year (1 = Jan 1)
 * @returns Declination in degrees (−23.44 … +23.44)
 */
function sunDeclination(doy: number): number {
  return (
    23.44 * Math.sin(toRad((360 / 365) * (doy - 81)))
  );
}

/**
 * Approximate equation of time in minutes.
 *
 * The equation of time accounts for the discrepancy between
 * apparent solar time (sundial) and mean solar time (clock)
 * caused by the Earth's elliptical orbit and axial tilt.
 *
 * Formula (from the SQL spiritual.equation_of_time):
 *   EOT = 229.2 × (0.000075
 *     + 0.001868·cos(g) − 0.032077·sin(g)
 *     − 0.014615·cos(2g) − 0.04089·sin(2g))
 *   where g = 360/365 × (doy − 1)  [in radians]
 *
 * @param doy Day of year
 * @returns Equation of time in minutes (−16 … +16)
 */
function equationOfTime(doy: number): number {
  const g = toRad((360 / 365) * (doy - 1));
  return (
    229.2 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.04089 * Math.sin(2 * g))
  );
}

/**
 * Compute the hour angle for a given solar altitude.
 *
 * The hour angle is the angular distance (measured in degrees along
 * the celestial equator) between the observer's meridian and the
 * sun's position.  It is used to determine when the sun reaches a
 * specific altitude.
 *
 * Formula:
 *   cos(HA) = (sin(altitude) − sin(lat)·sin(δ)) / (cos(lat)·cos(δ))
 *   HA = acos(cos(HA))
 *
 * At high latitudes the argument to acos may fall outside [−1, +1]
 * (when the sun never reaches the given altitude).  In that case we
 * clamp to the nearest valid value (extreme-latitude method):
 *   – cos > +1 → sun never gets low enough → HA = 180° (midnight)
 *   – cos < −1 → sun never gets high enough → HA = 0°  (noon)
 *
 * @param lat      Observer latitude in decimal degrees
 * @param dec      Solar declination in degrees
 * @param altitude Target solar altitude in degrees (negative = below horizon)
 * @returns Hour angle in degrees (0 … 180)
 */
function hourAngle(lat: number, dec: number, altitude: number): number {
  const latRad = toRad(lat);
  const decRad = toRad(dec);
  const altRad = toRad(altitude);

  const cosHA =
    (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  // Clamp to [-1, 1] for extreme latitudes
  const clamped = Math.max(-1, Math.min(1, cosHA));

  return toDeg(Math.acos(clamped));
}

/**
 * Compute the sun's altitude at Asr time.
 *
 * - Standard (Shāfiʿī, Mālikī, Ḥanbalī): shadow length = object height
 *   → altitude = arctan(1 + tan(|lat − δ|))
 *
 * - Ḥanafī: shadow length = 2 × object height
 *   → altitude = arctan(2 + tan(|lat − δ|))
 *
 * @param lat       Observer latitude in degrees
 * @param dec       Solar declination in degrees
 * @param asrMethod "standard" or "hanafi"
 * @returns Solar altitude in degrees (positive, above horizon)
 */
function asrAltitude(
  lat: number,
  dec: number,
  asrMethod: "standard" | "hanafi",
): number {
  const factor = asrMethod === "hanafi" ? 2 : 1;
  return toDeg(
    Math.atan(factor + Math.tan(toRad(Math.abs(lat - dec)))),
  );
}

// ---- Main Computation -------------------------------------------

/**
 * Compute the five daily Islamic prayer times for a given
 * date, location, timezone, and calculation method.
 *
 * **Algorithm overview (referenced to the SQL schema):**
 *
 * 1. **Day of year** — extract doy from the input date.
 * 2. **Solar declination** — δ = 23.44°·sin(360/365·(doy−81))
 * 3. **Equation of time** — EOT in minutes (see equationOfTime).
 * 4. **Solar noon** in local standard time minutes from midnight:
 *      noon = 720 − lng×4 − EOT + tz×60
 *    where 720 = 12:00 in minutes, lng×4 = longitude time correction
 *    (4 min/°), and tz×60 converts the UTC offset to minutes.
 * 5. **Hour angles** — for each prayer altitude:
 *    - Fajr:    altitude = −method.fajrAngle
 *    - Sunrise: altitude = −0.833°  (atmospheric refraction)
 *    - Asr:     altitude = atan(factor + tan(|lat−δ|))
 *    - Isha:    altitude = −method.ishaAngle  (or interval-based)
 * 6. **Prayer times** as offsets from noon:
 *      time = noon ± HA×4   (4 min/°)
 *    - Fajr/Sunrise occur **before** noon (minus).
 *    - Asr/Maghrib/Isha occur **after** noon (plus).
 *    - Dhuhr = noon.
 * 7. **Interval-based Isha** — when ishaIntervalMinutes is set,
 *    Isha = Maghrib + interval, bypassing the angle formula.
 * 8. **Result** — all times converted to UTC Date objects.
 *
 * **Extreme latitudes:**
 * If the sun never reaches a required altitude (polar day/night),
 * the hour-angle argument is clamped to [−1, +1], yielding the
 * nearest valid time (midnight or noon).
 *
 * @param date      Calendar date (time-of-day is ignored)
 * @param lat       Latitude in decimal degrees (−90 … +90)
 * @param lng       Longitude in decimal degrees (−180 … +180)
 * @param timezone  UTC offset in hours (e.g. 3 for UTC+3, −5 for UTC−5)
 * @param method    PrayerMethod describing the Fajr/Isha angles
 * @param asrMethod "standard" (default) or "hanafi"
 * @returns PrayerTimes object with all times as Date instances
 */
export function computePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number,
  method: PrayerMethod,
  asrMethod: "standard" | "hanafi" = "standard",
): PrayerTimes {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const doy = dayOfYear(date);

  // Solar position
  const dec = sunDeclination(doy);
  const eot = equationOfTime(doy);

  // ---- Solar noon in minutes from local midnight ----------------
  // noon_local = 12:00(720min) - lng×4 - EOT + tz×60
  const noonLocal = 720 - lng * 4 - eot + timezone * 60;

  // ---- Hour angles ----------------------------------------------
  const sunriseHA = hourAngle(lat, dec, -0.833);
  const fajrHA = hourAngle(lat, dec, -method.fajrAngle);

  // Asr: altitude is positive (above horizon)
  const asrAlt = asrAltitude(lat, dec, asrMethod);
  const asrHA = hourAngle(lat, dec, asrAlt);

  // ---- Prayer times (minutes from local midnight) ---------------
  const fajrMinutes = noonLocal - fajrHA * 4;
  const sunriseMinutes = noonLocal - sunriseHA * 4;
  const dhuhrMinutes = noonLocal;
  const asrMinutes = noonLocal + asrHA * 4;
  const maghribMinutes = noonLocal + sunriseHA * 4;

  let ishaMinutes: number;
  let finalIshaAngle: number;

  if (method.ishaIntervalMinutes !== null) {
    // Interval-based: Isha = Maghrib + N minutes
    ishaMinutes = maghribMinutes + method.ishaIntervalMinutes;
    finalIshaAngle = method.ishaAngle ?? 17;
  } else {
    const angle = method.ishaAngle ?? 17;
    finalIshaAngle = angle;
    const ishaHA = hourAngle(lat, dec, -angle);
    ishaMinutes = noonLocal + ishaHA * 4;
  }

  // ---- Convert local-minutes to UTC Date objects ----------------
  const utcMidnightMs = Date.UTC(year, month, day, 0, 0, 0, 0);

  /** Convert a local-time minute value to a UTC Date. */
  function localMinToDate(localMin: number): Date {
    return new Date(utcMidnightMs + (localMin - timezone * 60) * 60 * 1000);
  }

  return {
    fajr: localMinToDate(fajrMinutes),
    sunrise: localMinToDate(sunriseMinutes),
    dhuhr: localMinToDate(dhuhrMinutes),
    asr: localMinToDate(asrMinutes),
    maghrib: localMinToDate(maghribMinutes),
    isha: localMinToDate(ishaMinutes),
    fajrAngle: method.fajrAngle,
    ishaAngle: finalIshaAngle,
  };
}
