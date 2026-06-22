import { create } from "zustand";
import {
  tasbihPresetCreateSchema,
  tasbihSessionCreateSchema,
  type TasbihPresetCreateInput,
  type TasbihSessionCreateInput,
} from "~/schemas/tasbih";

interface TasbihPreset {
  id: number;
  name: string;
  target: number;
  dhikr: string;
  sort_order: number;
  created_at: string;
}

interface TasbihSession {
  id: number;
  user_id: string;
  preset_id: number;
  completed_count: number;
  started_at: string;
}

interface TasbihState {
  presets: TasbihPreset[];
  sessions: TasbihSession[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  fetchPresets: () => Promise<void>;
  addPreset: (data: TasbihPresetCreateInput) => Promise<{ success: boolean; error?: string }>;
  fetchSessions: () => Promise<void>;
  addSession: (data: TasbihSessionCreateInput) => Promise<{ success: boolean; error?: string }>;
}

export const useTasbihStore = create<TasbihState>((set) => ({
  presets: [],
  sessions: [],
  totalCount: 0,
  loading: false,
  error: null,

  fetchPresets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/tasbih");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ presets: data.presets ?? [], sessions: data.sessions ?? [], totalCount: data.total_count ?? 0, loading: false });
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
      const res = await fetch("/api/tasbih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const preset = await res.json();
      set((state) => ({ presets: [...state.presets, preset] }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/tasbih");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ presets: data.presets ?? [], sessions: data.sessions ?? [], totalCount: data.total_count ?? 0, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addSession: async (data) => {
    const parsed = tasbihSessionCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const res = await fetch("/api/tasbih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const session = await res.json();
      set((state) => ({ sessions: [session, ...state.sessions] }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },
}));
