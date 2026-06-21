// ============================================================
// ASTRO: sun times, moon phase, qibla direction calculations
// ============================================================

export type MoonPhaseData = {
  phase:
    | "new_moon"
    | "waxing_crescent"
    | "first_quarter"
    | "waxing_gibbous"
    | "full_moon"
    | "waning_gibbous"
    | "third_quarter"
    | "waning_crescent";
  illumination: number; // 0-100
  age: number; // days since new moon
  distance_km: number; // approximate distance
  next_new_moon: Date;
  next_full_moon: Date;
};

export type QiblaData = {
  bearing: number; // degrees from north (0-360)
  distance_km: number; // great-circle distance to Kaaba
  kaaba_lat: number; // 21.4225
  kaaba_lng: number; // 39.8262
};

export type SunData = {
  sunrise: Date;
  sunset: Date;
  solar_noon: Date;
  day_length_seconds: number;
};

// ---- Helpers ----------------------------------------------------------

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Compute Julian Day for a Gregorian date at noon UTC. */
function julianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Day of year (1-indexed). */
function dayOfYear(year: number, month: number, day: number): number {
  const epochMs = Date.UTC(year, 0, 1);
  const targetMs = Date.UTC(year, month - 1, day);
  return Math.floor((targetMs - epochMs) / 86400000) + 1;
}

/** Build a Date from a UTC day + hours (fractional). */
function utcHoursToDate(
  year: number,
  month: number,
  day: number,
  hours: number,
): Date {
  const totalMs = hours * 3600000;
  return new Date(Date.UTC(year, month - 1, day) + totalMs);
}

// ---- Sun times --------------------------------------------------------
//
// Uses the solar position algorithm with equation of time + declination.
// Refraction correction: -0.833° for sunrise/sunset.

export function computeSunData(date: Date, lat: number, lng: number): SunData {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const n = dayOfYear(year, month, day);

  // Mean anomaly of the Sun (fractional year in radians)
  const beta = (2 * Math.PI / 365) * (n - 1);

  // Equation of time (minutes)
  const eotMinutes =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(beta) -
      0.032077 * Math.sin(beta) -
      0.014615 * Math.cos(2 * beta) -
      0.04089 * Math.sin(2 * beta));

  // Solar declination (radians)
  const declination =
    0.006918 -
    0.399912 * Math.cos(beta) +
    0.070257 * Math.sin(beta) -
    0.006758 * Math.cos(2 * beta) +
    0.000907 * Math.sin(2 * beta) -
    0.002697 * Math.cos(3 * beta) +
    0.00148 * Math.sin(3 * beta);

  const latRad = toRad(lat);
  const decRad = declination;

  // Hour angle at sunrise/sunset (refraction corrected, -0.833°)
  const cosH =
    (Math.sin(toRad(-0.833)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  // If |cosH| > 1, no sunrise/sunset (polar day/night)
  // Clamp to valid range so acos doesn't NaN
  let hourAngle = 0;
  if (cosH < -1) {
    hourAngle = 180; // midnight sun — sun doesn't set
  } else if (cosH > 1) {
    hourAngle = 0; // polar night — sun doesn't rise
  } else {
    hourAngle = toDeg(Math.acos(cosH));
  }

  // Solar noon in UTC hours
  const solarNoonUTC = 12 - lng / 15 - eotMinutes / 60;

  const solarNoon = utcHoursToDate(year, month, day, solarNoonUTC);
  const sunrise = utcHoursToDate(year, month, day, solarNoonUTC - hourAngle / 15);
  const sunset = utcHoursToDate(year, month, day, solarNoonUTC + hourAngle / 15);

  const dayLengthSec = Math.round(
    (sunset.getTime() - sunrise.getTime()) / 1000,
  );

  return {
    sunrise,
    sunset,
    solar_noon: solarNoon,
    day_length_seconds: Math.max(0, dayLengthSec),
  };
}

// ---- Moon phase -------------------------------------------------------
//
// Simplified algorithm based on known new moon reference.
// Reference: New moon at 2000-01-06 00:00 UTC (JD 2451549.5)
// Lunar cycle: 29.53058867 days

const LUNAR_CYCLE = 29.53058867;
const REFERENCE_JD = 2451549.5; // 2000-01-06 00:00 UTC (approximate new moon)
const LUNAR_MONTH_NAMES = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "third_quarter",
  "waning_crescent",
] as const;

export function computeMoonPhase(date: Date): MoonPhaseData {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const jd = julianDay(year, month, day);
  const daysSinceRef = jd - 0.5 - REFERENCE_JD; // julianDay gives noon, we want midnight
  const cycles = daysSinceRef / LUNAR_CYCLE;
  const fraction = cycles - Math.floor(cycles);

  const age = fraction * LUNAR_CYCLE;
  const illumination =
    ((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100;

  // Determine which of 8 phases
  const phaseIndex = Math.floor((fraction * LUNAR_CYCLE) / (LUNAR_CYCLE / 8)) % 8;
  const phase = LUNAR_MONTH_NAMES[phaseIndex];

  // Moon's mean anomaly for distance approximation
  const jdNow = jd - 0.5; // midnight UTC
  const T = (jdNow - 2451545.0) / 36525.0;
  let M_deg = 134.96 + 477198.85 * T;
  M_deg = ((M_deg % 360) + 360) % 360;
  const M_rad = toRad(M_deg);
  const distanceKm = Math.round(384400 * (1 - 0.0549 * Math.cos(M_rad)));

  // Next new moon
  const daysToNextNew = LUNAR_CYCLE - age;
  const nextNewMoon = new Date(
    Date.UTC(year, month - 1, day) + daysToNextNew * 86400000,
  );

  // Next full moon
  const daysToNextFull =
    age <= LUNAR_CYCLE / 2
      ? LUNAR_CYCLE / 2 - age
      : LUNAR_CYCLE - age + LUNAR_CYCLE / 2;
  const nextFullMoon = new Date(
    Date.UTC(year, month - 1, day) + daysToNextFull * 86400000,
  );

  return {
    phase,
    illumination: Math.round(illumination * 10) / 10,
    age: Math.round(age * 100) / 100,
    distance_km: distanceKm,
    next_new_moon: nextNewMoon,
    next_full_moon: nextFullMoon,
  };
}

// ---- Qibla direction --------------------------------------------------
//
// Spherical trigonometry from the SQL compute_qibla() function.
// Kaaba: lat=21.4225, lng=39.8262

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_RADIUS_KM = 6371;

export function computeQibla(lat: number, lng: number): QiblaData {
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = toRad(KAABA_LAT);
  const lng2 = toRad(KAABA_LNG);
  const deltaLng = lng2 - lng1;

  // Bearing formula (spherical trigonometry)
  const bearingRad = Math.atan2(
    Math.sin(deltaLng),
    Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLng),
  );
  let bearing = toDeg(bearingRad);
  bearing = ((bearing % 360) + 360) % 360;

  // Haversine distance
  const deltaLat = lat2 - lat1;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round((EARTH_RADIUS_KM * c) * 100) / 100;

  return {
    bearing: Math.round(bearing * 100) / 100,
    distance_km: distanceKm,
    kaaba_lat: KAABA_LAT,
    kaaba_lng: KAABA_LNG,
  };
}
