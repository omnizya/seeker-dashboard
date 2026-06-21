/** Shared types and helpers for sunrise/sunset API. */

export type SunriseSunsetResult = {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: number;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
};

export type SunriseSunsetApiResponse = {
  results: SunriseSunsetResult;
  status: "OK";
  tzid: string;
};

export type GeocodingResult = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
};

/** Validate and parse lat/lng strings. Returns an error message or { lat, lng }. */
export function parseCoordinates(
  lat: string | null,
  lng: string | null,
): { lat: number; lng: number } | { error: string; status: number } {
  if (!lat || !lng) {
    return { error: "lat and lng query parameters are required", status: 400 };
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return { error: "lat and lng must be valid numbers", status: 400 };
  }

  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return { error: "lat (-90 to 90) or lng (-180 to 180) out of range", status: 400 };
  }

  return { lat: latNum, lng: lngNum };
}

/** Fetch sunrise/sunset data from the external API. */
export async function fetchSunriseSunset(
  lat: number,
  lng: number,
  date: string = "today",
): Promise<SunriseSunsetApiResponse> {
  const res = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${date}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sunrise/sunset data");
  }

  const data: SunriseSunsetApiResponse = await res.json();

  if (data.status !== "OK") {
    throw new Error("External API returned non-OK status");
  }

  return data;
}
