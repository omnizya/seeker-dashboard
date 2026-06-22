import { create } from "zustand";
import {
  duaListCreateSchema,
  duaEntryCreateSchema,
  type DuaListCreateInput,
  type DuaEntryCreateInput,
} from "~/schemas/dua";

interface DuaList {
  id: string;
  name: string;
  category?: string;
  created_at: string;
}

interface DuaEntry {
  id: string;
  list_id: string;
  title: string;
  content: string;
  arabic_text?: string;
  created_at: string;
}

interface DuaState {
  lists: DuaList[];
  entries: DuaEntry[];
  loading: boolean;
  error: string | null;

  fetchLists: () => Promise<void>;
  addList: (data: DuaListCreateInput) => Promise<{ success: boolean; error?: string }>;
  fetchEntries: (listId?: string) => Promise<void>;
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
      const res = await fetch("/api/dua");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ lists: data, loading: false });
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
      const res = await fetch("/api/dua", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "list", ...parsed.data }),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const list = await res.json();
      set((state) => ({ lists: [list, ...state.lists] }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  fetchEntries: async (listId) => {
    set({ loading: true, error: null });
    try {
      const url = listId ? `/api/dua?list_id=${listId}` : "/api/dua";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ entries: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addEntry: async (data) => {
    const parsed = duaEntryCreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const res = await fetch("/api/dua", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "entry", ...parsed.data }),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const entry = await res.json();
      set((state) => ({ entries: [entry, ...state.entries] }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },
}));
