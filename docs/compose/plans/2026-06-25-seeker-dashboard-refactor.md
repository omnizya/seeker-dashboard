# Seeker Dashboard Refactor: Consume seeker-api

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace seeker-dashboard's 20 Next.js API routes with direct communication to seeker-api, add a centralized API client, and migrate data fetching to SWR.

**Architecture:** Single `src/lib/api.ts` module handles all HTTP communication with seeker-api. Zustand stores become thin wrappers calling the API client. Pages/components use SWR hooks instead of `useEffect + fetch + useState`. Auth switches from Supabase cookies to JWT tokens stored in Zustand + localStorage.

**Tech Stack:** Next.js 16, Zustand, SWR, Zod v4, shadcn/ui, Tailwind v3, Bun

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/api.ts` | Centralized HTTP client: base URL, auth headers, JSON parsing, error normalization, 401 handling |
| `src/lib/fetcher.ts` | SWR-compatible fetcher function that wraps `api.get()` |
| `src/types/api.ts` | Shared API response types (mirrors seeker-api response schemas) |
| `src/stores/authStore.ts` | Auth state + JWT token management (tokens in Zustand + localStorage) |
| `src/stores/bookmarkStore.ts` | Bookmark CRUD via API client |
| `src/stores/journalStore.ts` | Journal CRUD via API client |
| `src/stores/tasbihStore.ts` | Tasbih CRUD via API client |
| `src/stores/duaStore.ts` | Dua CRUD via API client |
| `src/app/dashboard/prayer/page.tsx` | Prayer times via SWR |
| `src/app/dashboard/astro/page.tsx` | Astro data via SWR |
| `src/app/dashboard/quran/page.tsx` | Quran ayahs via SWR |
| `src/app/dashboard/quran/[id]/page.tsx` | Single ayah + bookmarks via SWR |
| `src/app/dashboard/bookmarks/page.tsx` | Bookmarks via SWR |
| `src/app/dashboard/journal/page.tsx` | Journal via SWR |
| `src/app/dashboard/tasbih/page.tsx` | Tasbih via SWR |
| `src/app/dashboard/dua/page.tsx` | Dua via SWR |
| `src/app/dashboard/lodge/page.tsx` | Lodge via API client |
| `src/app/dashboard/page.tsx` | Auth guard (client-side) |
| `src/components/PlanetaryHoursCard.tsx` | Planetary hours via SWR |
| `src/components/GeoDataCard.tsx` | Geo data via SWR |
| `src/components/HolyNames.tsx` | Holy names via SWR (replaces direct Supabase query) |

---

### Task 1: Create API Client

**Covers:** [S2], [S3]

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create the API client module**

```typescript
// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function loadTokens() {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  }
}

export function getAccessToken() {
  return accessToken;
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access_token: string; refresh_token: string };
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function authHeaders(): Record<string, string> {
  if (accessToken) return { Authorization: `Bearer ${accessToken}` };
  return {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...fetchOptions.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...fetchOptions,
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryRes = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retryRes.ok) {
        clearTokens();
        throw new Error("Unauthorized");
      }
      return retryRes.json() as Promise<T>;
    }
    clearTokens();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("DELETE", path, body, options),
};
```

- [ ] **Step 2: Run typecheck**

Run: `bun run build`
Expected: No errors related to `src/lib/api.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: add centralized API client for seeker-api communication"
```

---

### Task 2: Create API Response Types

**Covers:** [S2], [S5]

**Files:**
- Create: `src/types/api.ts`

- [ ] **Step 1: Create response types**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/api.ts
git commit -m "feat: add shared API response types"
```

---

### Task 3: Create SWR Fetcher

**Covers:** [S2]

**Files:**
- Create: `src/lib/fetcher.ts`

- [ ] **Step 1: Create the SWR fetcher**

```typescript
// src/lib/fetcher.ts

import { api } from "~/lib/api";

export function swrFetcher<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return api.get<T>(path, { params });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fetcher.ts
git commit -m "feat: add SWR fetcher using centralized API client"
```

---

### Task 4: Update Auth Store

**Covers:** [S3], [S4]

**Files:**
- Modify: `src/stores/authStore.ts`

- [ ] **Step 1: Rewrite authStore to use API client with JWT**

```typescript
// src/stores/authStore.ts

import { create } from "zustand";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "~/schemas/auth";
import { api, setTokens, clearTokens, loadTokens, getAccessToken } from "~/lib/api";
import type { LoginResponse, RegisterResponse } from "~/types/api";

interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
  error: string | null;

  login: (data: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: { id: string; email: string } | null) => void;
  setError: (error: string | null) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (data) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    set({ loading: true, error: null });
    try {
      const result = await api.post<LoginResponse>("/api/auth/login", parsed.data);
      setTokens(result.access_token, result.refresh_token);
      const user = result.user as { id: string; email: string };
      set({ user, loading: false });
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "خطأ في الشبكة";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    set({ loading: true, error: null });
    try {
      await api.post<RegisterResponse>("/api/auth/register", {
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
      });
      set({ loading: false });
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : "خطأ في الشبكة";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),

  initAuth: () => {
    loadTokens();
    const token = getAccessToken();
    if (token) {
      // Try to get user info from the token or fetch /api/auth/me
      api.get<{ user: { id: string; email: string } | null }>("/api/auth/me")
        .then((data) => {
          if (data.user) set({ user: { id: data.user.id, email: data.user.email ?? "" } });
        })
        .catch(() => {
          clearTokens();
        });
    }
  },
}));
```

- [ ] **Step 2: Run typecheck**

Run: `bun run build`
Expected: No errors related to authStore

- [ ] **Step 3: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat: rewrite authStore to use JWT tokens via API client"
```

---

### Task 5: Update Bookmark Store

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/stores/bookmarkStore.ts`

- [ ] **Step 1: Rewrite bookmarkStore to use API client**

```typescript
// src/stores/bookmarkStore.ts

import { create } from "zustand";
import {
  bookmarkCreateSchema,
  bookmarkDeleteSchema,
  type BookmarkCreateInput,
} from "~/schemas/bookmark";
import { api } from "~/lib/api";
import type { Bookmark } from "~/types/api";

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;

  fetchBookmarks: (surahId?: number) => Promise<void>;
  addBookmark: (data: BookmarkCreateInput) => Promise<{ success: boolean; error?: string }>;
  deleteBookmark: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export const useBookmarkStore = create<BookmarkState>((set) => ({
  bookmarks: [],
  loading: false,
  error: null,

  fetchBookmarks: async (surahId) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Bookmark[]>("/api/bookmarks", {
        params: surahId ? { surah_id: surahId } : undefined,
      });
      set({ bookmarks: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addBookmark: async (data) => {
    const parsed = bookmarkCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const bookmark = await api.post<Bookmark>("/api/bookmarks", parsed.data);
      set((state) => ({ bookmarks: [bookmark, ...state.bookmarks] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },

  deleteBookmark: async (id) => {
    const parsed = bookmarkDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: "Invalid bookmark ID" };
    }

    try {
      await api.delete("/api/bookmarks", { id: parsed.data.id });
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/bookmarkStore.ts
git commit -m "feat: rewrite bookmarkStore to use API client"
```

---

### Task 6: Update Journal, Tasbih, Dua Stores

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/stores/journalStore.ts`
- Modify: `src/stores/tasbihStore.ts`
- Modify: `src/stores/duaStore.ts`

- [ ] **Step 1: Rewrite journalStore**

```typescript
// src/stores/journalStore.ts

import { create } from "zustand";
import {
  journalEntryCreateSchema,
  journalEntryUpdateSchema,
  journalEntryDeleteSchema,
  type JournalEntryCreateInput,
  type JournalEntryUpdateInput,
} from "~/schemas/journal";
import { api } from "~/lib/api";
import type { JournalEntry } from "~/types/api";

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;

  fetchEntries: (entryType?: string) => Promise<void>;
  addEntry: (data: JournalEntryCreateInput) => Promise<{ success: boolean; error?: string }>;
  updateEntry: (data: JournalEntryUpdateInput) => Promise<{ success: boolean; error?: string }>;
  deleteEntry: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async (entryType) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<JournalEntry[]>("/api/journal", {
        params: entryType ? { entry_type: entryType } : undefined,
      });
      set({ entries: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addEntry: async (data) => {
    const parsed = journalEntryCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const entry = await api.post<JournalEntry>("/api/journal", parsed.data);
      set((state) => ({ entries: [entry, ...state.entries] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },

  updateEntry: async (data) => {
    const parsed = journalEntryUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const updated = await api.put<JournalEntry>("/api/journal", parsed.data);
      set((state) => ({
        entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },

  deleteEntry: async (id) => {
    const parsed = journalEntryDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: "Invalid entry ID" };
    }

    try {
      await api.delete("/api/journal", { id: parsed.data.id });
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },
}));
```

- [ ] **Step 2: Rewrite tasbihStore**

```typescript
// src/stores/tasbihStore.ts

import { create } from "zustand";
import {
  tasbihPresetCreateSchema,
  tasbihSessionCreateSchema,
  type TasbihPresetCreateInput,
  type TasbihSessionCreateInput,
} from "~/schemas/tasbih";
import { api } from "~/lib/api";
import type { TasbihPreset, TasbihSession, TasbihResponse } from "~/types/api";

interface TasbihState {
  presets: TasbihPreset[];
  sessions: TasbihSession[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
  addPreset: (data: TasbihPresetCreateInput) => Promise<{ success: boolean; error?: string }>;
  addSession: (data: TasbihSessionCreateInput) => Promise<{ success: boolean; error?: string }>;
}

export const useTasbihStore = create<TasbihState>((set) => ({
  presets: [],
  sessions: [],
  totalCount: 0,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<TasbihResponse>("/api/tasbih");
      set({
        presets: data.presets,
        sessions: data.sessions,
        totalCount: data.total_count,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addPreset: async (data) => {
    const parsed = tasbihPresetCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const preset = await api.post<TasbihPreset>("/api/tasbih", { type: "preset", ...parsed.data });
      set((state) => ({ presets: [...state.presets, preset] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },

  addSession: async (data) => {
    const parsed = tasbihSessionCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const session = await api.post<TasbihSession>("/api/tasbih", { type: "session", ...parsed.data });
      set((state) => ({ sessions: [...state.sessions, session] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },
}));
```

- [ ] **Step 3: Rewrite duaStore**

```typescript
// src/stores/duaStore.ts

import { create } from "zustand";
import {
  duaListCreateSchema,
  duaEntryCreateSchema,
  type DuaListCreateInput,
  type DuaEntryCreateInput,
} from "~/schemas/dua";
import { api } from "~/lib/api";
import type { DuaList } from "~/types/api";

interface DuaState {
  lists: DuaList[];
  entries: DuaList["entries"];
  loading: boolean;
  error: string | null;

  fetchLists: () => Promise<void>;
  fetchEntries: (listId: number) => Promise<void>;
  addList: (data: DuaListCreateInput) => Promise<{ success: boolean; error?: string }>;
  addEntry: (data: DuaEntryCreateInput) => Promise<{ success: boolean; error?: string }>;
}

export const useDuaStore = create<DuaState>((set) => ({
  lists: [],
  entries: [],
  loading: false,
  error: null,

  fetchLists: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<DuaList[]>("/api/dua");
      set({ lists: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchEntries: async (listId) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<DuaList["entries"]>("/api/dua", {
        params: { list_id: listId },
      });
      set({ entries: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addList: async (data) => {
    const parsed = duaListCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const list = await api.post<DuaList>("/api/dua", parsed.data);
      set((state) => ({ lists: [...state.lists, list] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },

  addEntry: async (data) => {
    const parsed = duaEntryCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const entry = await api.post("/api/dua", parsed.data);
      set((state) => ({ entries: [...state.entries, entry as DuaList["entries"][number]] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message ?? "Network error" };
    }
  },
}));
```

- [ ] **Step 4: Run typecheck**

Run: `bun run build`
Expected: No errors related to stores

- [ ] **Step 5: Commit**

```bash
git add src/stores/journalStore.ts src/stores/tasbihStore.ts src/stores/duaStore.ts
git commit -m "feat: rewrite journal, tasbih, dua stores to use API client"
```

---

### Task 7: Update Public Pages (Prayer, Astro, Quran, Jummal)

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/app/dashboard/prayer/page.tsx`
- Modify: `src/app/dashboard/astro/page.tsx`
- Modify: `src/app/dashboard/quran/page.tsx`
- Modify: `src/app/dashboard/quran/[id]/page.tsx`

- [ ] **Step 1: Rewrite prayer page with SWR**

Replace the `useEffect + fetch + useState` pattern with `useSWR`. Keep the existing UI rendering unchanged.

```typescript
// src/app/dashboard/prayer/page.tsx
// Key changes:
// - Replace useEffect + fetch + useState with useSWR
// - Import useSWR from "swr"
// - Import swrFetcher from "~/lib/fetcher"
// - Use: const { data, error, isLoading } = useSWR<PrayerResponse>(
//   geo.latitude && geo.longitude
//     ? `/api/prayer?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateStr}&method=${method}`
//     : null,
//   swrFetcher
// );
// - Remove manual loading/error state management
// - Keep all UI rendering code identical
```

- [ ] **Step 2: Rewrite astro page with SWR**

Same pattern: replace useEffect+fetch with useSWR.

```typescript
// src/app/dashboard/astro/page.tsx
// Key changes:
// - Replace useEffect + fetch + useState with useSWR
// - Use: const { data, error, isLoading } = useSWR<AstroResponse>(
//   geo.latitude && geo.longitude
//     ? `/api/astro?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateStr}`
//     : null,
//   swrFetcher
// );
```

- [ ] **Step 3: Rewrite quran page with SWR**

The quran page currently streams gzipped NDJSON. seeker-api returns a standard JSON array. Replace with simple SWR fetch.

```typescript
// src/app/dashboard/quran/page.tsx
// Key changes:
// - Remove NDJSON streaming logic
// - Replace with: const { data, error, isLoading } = useSWR<QuranAyah[]>(
//   "/api/quran",
//   swrFetcher
// );
// - Keep pagination logic but use data from SWR
```

- [ ] **Step 4: Rewrite quran/[id] page with SWR**

```typescript
// src/app/dashboard/quran/[id]/page.tsx
// Key changes:
// - Replace fetch for ayah with: const { data: ayah } = useSWR<QuranAyah>(
//   `/api/quran/${id}`, swrFetcher
// );
// - Replace fetch for bookmarks with: const { data: bookmarks } = useSWR<Bookmark[]>(
//   `/api/bookmarks?ayah_id=${id}`, swrFetcher
// );
// - Keep bookmark add/delete using useBookmarkStore (already updated)
```

- [ ] **Step 5: Run typecheck**

Run: `bun run build`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/prayer/page.tsx src/app/dashboard/astro/page.tsx \
  src/app/dashboard/quran/page.tsx "src/app/dashboard/quran/[id]/page.tsx"
git commit -m "feat: migrate prayer, astro, quran pages to SWR"
```

---

### Task 8: Update Auth-Protected Pages (Bookmarks, Journal, Tasbih, Dua)

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/app/dashboard/bookmarks/page.tsx`
- Modify: `src/app/dashboard/journal/page.tsx`
- Modify: `src/app/dashboard/tasbih/page.tsx`
- Modify: `src/app/dashboard/dua/page.tsx`

- [ ] **Step 1: Rewrite bookmarks page with SWR**

```typescript
// src/app/dashboard/bookmarks/page.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR
// - Use: const { data: bookmarks, mutate } = useSWR<Bookmark[]>(
//   "/api/bookmarks", swrFetcher
// );
// - Keep using useBookmarkStore for add/delete actions
```

- [ ] **Step 2: Rewrite journal page with SWR**

```typescript
// src/app/dashboard/journal/page.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR
// - Use: const { data: entries } = useSWR<JournalEntry[]>(
//   "/api/journal", swrFetcher
// );
// - Keep using useJournalStore for CRUD actions
```

- [ ] **Step 3: Rewrite tasbih page with SWR**

```typescript
// src/app/dashboard/tasbih/page.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR
// - Use: const { data: tasbihData } = useSWR<TasbihResponse>(
//   "/api/tasbih", swrFetcher
// );
// - Keep using useTasbihStore for add actions
```

- [ ] **Step 4: Rewrite dua page with SWR**

```typescript
// src/app/dashboard/dua/page.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR
// - Use: const { data: lists } = useSWR<DuaList[]>(
//   "/api/dua", swrFetcher
// );
// - Keep using useDuaStore for add actions
```

- [ ] **Step 5: Run typecheck**

Run: `bun run build`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/bookmarks/page.tsx src/app/dashboard/journal/page.tsx \
  src/app/dashboard/tasbih/page.tsx src/app/dashboard/dua/page.tsx
git commit -m "feat: migrate bookmarks, journal, tasbih, dua pages to SWR"
```

---

### Task 9: Update Lodge Page

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/app/dashboard/lodge/page.tsx`

- [ ] **Step 1: Rewrite lodge page to use API client**

The lodge page uses a single `/api/lodge` route with different `action` fields. seeker-api splits this into `/api/lodge/compute` and `/api/lodge/validate`. Update the fetch calls accordingly.

```typescript
// src/app/dashboard/lodge/page.tsx
// Key changes:
// - Import { api } from "~/lib/api"
// - Import types from seeker-api: LodgeComputeResponse, LodgeValidateResponse
// - Replace fetch("/api/lodge") GET with: api.get("/api/lodge") (or remove if not needed)
// - Replace fetch("/api/lodge", { body: { action: "start", intent } })
//   with: api.post("/api/lodge/compute", { intent })
// - Replace fetch("/api/lodge", { body: { action: "resonance", ... } })
//   with: api.post("/api/lodge/validate", { cells, completion })
// - Replace fetch("/api/lodge", { body: { action: "yield", ... } })
//   with: api.post("/api/lodge/compute", { durationTicks, interruptions, resonance })
// - Remove engine imports if no longer needed (engine is now server-side in seeker-api)
```

- [ ] **Step 2: Run typecheck**

Run: `bun run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/lodge/page.tsx
git commit -m "feat: migrate lodge page to use seeker-api endpoints"
```

---

### Task 10: Update Components (GeoDataCard, PlanetaryHoursCard, HolyNames)

**Covers:** [S2], [S5]

**Files:**
- Modify: `src/components/GeoDataCard.tsx`
- Modify: `src/components/PlanetaryHoursCard.tsx`
- Modify: `src/components/HolyNames.tsx`

- [ ] **Step 1: Rewrite GeoDataCard with SWR**

```typescript
// src/components/GeoDataCard.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR
// - Use: const { data, error, isLoading } = useSWR<SunriseResponse>(
//   geo.latitude && geo.longitude
//     ? `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}`
//     : null,
//   swrFetcher
// );
```

- [ ] **Step 2: Rewrite PlanetaryHoursCard with SWR**

```typescript
// src/components/PlanetaryHoursCard.tsx
// Key changes:
// - Replace useEffect + fetch with useSWR for sunrise data
// - Use: const { data: todayData } = useSWR<SunriseResponse>(
//   geo.latitude && geo.longitude
//     ? `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateParam(today)}`
//     : null,
//   swrFetcher
// );
// - Keep computePlanetaryHours utility (pure TS, still needed client-side)
```

- [ ] **Step 3: Rewrite HolyNames to use SWR**

```typescript
// src/components/HolyNames.tsx
// Key changes:
// - Remove direct Supabase client import
// - Replace with: const { data, error, isLoading } = useSWR<HolyName[]>(
//   "/api/holy-names", swrFetcher
// );
```

- [ ] **Step 4: Run typecheck**

Run: `bun run build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/GeoDataCard.tsx src/components/PlanetaryHoursCard.tsx src/components/HolyNames.tsx
git commit -m "feat: migrate GeoDataCard, PlanetaryHoursCard, HolyNames to SWR"
```

---

### Task 11: Update Dashboard Auth Guard

**Covers:** [S3], [S4]

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Replace Supabase server auth with client-side check**

The dashboard page is currently a Server Component that uses Supabase to check auth. Since we're removing Supabase, this needs to become a client-side check using the auth store.

```typescript
// src/app/dashboard/page.tsx
// Key changes:
// - Remove "import { createClient } from ~/utils/supabase/server"
// - Remove async function, make it a client component or use a wrapper
// - Add: "use client" at top
// - Import { useAuthStore } from "~/stores/authStore"
// - In useEffect: if (!user) redirect to /auth/login
// - Keep all child component rendering
```

- [ ] **Step 2: Run typecheck**

Run: `bun run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: replace Supabase auth guard with client-side auth check"
```

---

### Task 12: Update Environment and Remove Supabase Dependencies

**Covers:** [S6]

**Files:**
- Modify: `.env.local`
- Delete: `src/utils/supabase/server.ts`
- Delete: `src/utils/supabase/client.ts`
- Delete: `src/utils/supabase/middleware.ts`
- Delete: `src/utils/sunrise.ts`
- Modify: `package.json`

- [ ] **Step 1: Update .env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 2: Delete Supabase utility files**

```bash
rm src/utils/supabase/server.ts src/utils/supabase/client.ts src/utils/supabase/middleware.ts
```

- [ ] **Step 3: Delete sunrise utility**

```bash
rm src/utils/sunrise.ts
```

- [ ] **Step 4: Remove Supabase dependencies**

Run: `bun remove @supabase/ssr @supabase/supabase-js @supabase/auth-helpers-nextjs cookie`
Run: `bun remove -d @types/cookie`

- [ ] **Step 5: Remove devDependencies supabase CLI**

Run: `bun remove -d supabase`

- [ ] **Step 6: Run typecheck**

Run: `bun run build`
Expected: No errors related to removed files

- [ ] **Step 7: Commit**

```bash
git add .env.local package.json bun.lock
git rm src/utils/supabase/server.ts src/utils/supabase/client.ts src/utils/supabase/middleware.ts src/utils/sunrise.ts
git commit -m "feat: remove Supabase SDK and related utilities"
```

---

### Task 13: Remove All API Routes

**Covers:** [S6]

**Files:**
- Delete: `src/app/api/` (entire directory)

- [ ] **Step 1: Remove all API route files**

```bash
rm -rf src/app/api/
```

- [ ] **Step 2: Remove auth actions file**

The `src/app/auth/actions.ts` file contains server actions that call Supabase directly. Remove it since auth is now handled by seeker-api.

```bash
rm src/app/auth/actions.ts
```

- [ ] **Step 3: Run typecheck**

Run: `bun run build`
Expected: No errors (any imports from deleted files will fail — fix them)

- [ ] **Step 4: Fix any remaining imports**

If any files still import from deleted paths, update them to use the API client or remove the import.

- [ ] **Step 5: Run lint**

Run: `bun run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add -A src/app/api/ src/app/auth/actions.ts
git commit -m "feat: remove all Next.js API routes and Supabase auth actions"
```

---

### Task 14: Final Cleanup and Verification

**Covers:** [S6]

**Files:**
- Check: `src/app/auth/login/page.tsx` (update if it imports from deleted files)
- Check: `src/app/auth/register/page.tsx` (update if it imports from deleted files)
- Check: `next.config.mjs` (remove Supabase-related config)

- [ ] **Step 1: Update login page to use API client**

```typescript
// src/app/auth/login/page.tsx
// Key changes:
// - Remove server action import
// - Use useAuthStore().login() instead
```

- [ ] **Step 2: Update register page to use API client**

```typescript
// src/app/auth/register/page.tsx
// Key changes:
// - Remove server action import
// - Use useAuthStore().register() instead
```

- [ ] **Step 3: Clean up next.config.mjs**

Remove any Supabase-related configuration. Keep only what's needed for the app.

- [ ] **Step 4: Run full verification**

Run: `bun run build`
Expected: Clean build with no errors

Run: `bun run lint`
Expected: No lint errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete seeker-dashboard refactor to consume seeker-api

- Add centralized API client (src/lib/api.ts)
- Add SWR fetcher (src/lib/fetcher.ts)
- Add shared API response types (src/types/api.ts)
- Rewrite all Zustand stores to use API client
- Migrate all pages/components to SWR
- Replace Supabase auth with JWT tokens
- Remove all Next.js API routes
- Remove Supabase SDK and utilities"
```
