// src/types/api.ts

export interface ApiError {
  error: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; [key: string]: unknown };
}

export interface RegisterResponse {
  user: { id: string; email: string; [key: string]: unknown };
}

export interface PrayerTimesResponse {
  date: string;
  method: string;
  location: { lat: number; lng: number };
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  angles: { fajr: number; isha: number };
}

export interface AstroResponse {
  date: string;
  location: { lat: number; lng: number };
  sun: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
  };
  moon: {
    phase: string;
    illumination: number;
    rise?: string;
    set?: string;
  };
  qibla: {
    direction: number;
    latitude: number;
    longitude: number;
  };
}

export interface SunriseResponse {
  date: string;
  location: { lat: number; lng: number };
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
}

export interface JummalResponse {
  text: string;
  n: number;
}

export interface MagickSquareResponse {
  square: number[][];
  magicConstant: number;
}

export interface PlanetaryHoursResponse {
  date: string;
  hours: Array<{
    hourIndex: number;
    planet: string;
    start: string;
    end: string;
    isDaytime: boolean;
  }>;
}

export interface QuranAyah {
  id: number;
  surah: number;
  ayah: number;
  juz: number;
  page?: number;
  text: string;
}

export interface Bookmark {
  id: number;
  userId: string;
  ayahId: number;
  surahId?: number;
  ayahNumber?: number;
  ayahText?: string;
  label?: string;
  tags?: string[];
  color?: string;
  createdAt?: string;
}

export interface JournalEntry {
  id: number;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  entryType?: string;
  entryDate?: string;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TasbihPreset {
  id: number;
  name: string;
  target: number;
  dhikr?: string;
  sortOrder?: number;
}

export interface TasbihSession {
  id: number;
  presetId: number;
  count: number;
  completedCount?: number;
  startedAt: string;
}

export interface TasbihResponse {
  presets: TasbihPreset[];
  sessions: TasbihSession[];
  total_count: number;
}

export interface DuaEntry {
  id: number;
  listId: number;
  arabic: string;
  transliteration?: string;
  translation?: string;
  benefit?: string;
  sortOrder?: number;
}

export interface DuaList {
  id: number;
  title: string;
  description?: string;
  category?: string;
  source?: string;
  isPublic?: boolean;
  userId?: string;
  entries: DuaEntry[];
}

export interface LodgeComputeResponse {
  userId: string;
  intent: string;
  seed: number;
  element: string;
  square: number[][];
  magicConstant: number;
}

export interface LodgeValidateResponse {
  valid: boolean;
  cells: number[];
}

export interface HolyName {
  id: number;
  number: number;
  name: string;
  meaning: string;
  root?: string;
  occurrence?: number;
}
