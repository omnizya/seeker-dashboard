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
