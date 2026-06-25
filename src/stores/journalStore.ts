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
