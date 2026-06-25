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
