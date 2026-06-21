export const CHALDEAN_ORDER = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
] as const;

export type Planet = (typeof CHALDEAN_ORDER)[number];

/** Day-of-week → first-hour ruler (JS getDay: 0=Sun … 6=Sat) */
export const DAY_RULERS: Record<number, Planet> = {
  0: "Sun",
  1: "Moon",
  2: "Mars",
  3: "Mercury",
  4: "Jupiter",
  5: "Venus",
  6: "Saturn",
};

export type PlanetaryHour = {
  planet: Planet;
  start: Date;
  end: Date;
  isDaytime: boolean;
  hourIndex: number; // 0-23
};

/**
 * Compute all 24 planetary hours for a given day.
 *
 * @param sunriseISO  - today's sunrise (ISO string)
 * @param sunsetISO   - today's sunset (ISO string)
 * @param nextSunriseISO - tomorrow's sunrise (ISO string, for night hours)
 * @param date        - the Date object for today (used to determine weekday ruler)
 */
export function computePlanetaryHours(
  sunriseISO: string,
  sunsetISO: string,
  nextSunriseISO: string,
  date: Date,
): PlanetaryHour[] {
  const sunrise = new Date(sunriseISO);
  const sunset = new Date(sunsetISO);
  const nextSunrise = new Date(nextSunriseISO);

  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = nextSunrise.getTime() - sunset.getTime();

  const dayHourMs = dayMs / 12;
  const nightHourMs = nightMs / 12;

  const dayRuler = DAY_RULERS[date.getDay()];
  const startIdx = CHALDEAN_ORDER.indexOf(dayRuler);

  const hours: PlanetaryHour[] = [];

  for (let i = 0; i < 24; i++) {
    const planetIdx = (startIdx + i) % 7;
    const start =
      i < 12
        ? new Date(sunrise.getTime() + i * dayHourMs)
        : new Date(sunset.getTime() + (i - 12) * nightHourMs);
    const end =
      i < 12
        ? new Date(sunrise.getTime() + (i + 1) * dayHourMs)
        : i < 23
          ? new Date(sunset.getTime() + (i - 12 + 1) * nightHourMs)
          : nextSunrise;

    hours.push({
      planet: CHALDEAN_ORDER[planetIdx],
      start,
      end,
      isDaytime: i < 12,
      hourIndex: i,
    });
  }

  return hours;
}
