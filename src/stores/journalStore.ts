import { create } from "zustand";
import {
  journalEntryCreateSchema,
  journalEntryUpdateSchema,
  journalEntryDeleteSchema,
  type JournalEntryCreateInput,
  type JournalEntryUpdateInput,
} from "~/schemas/journal";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;

  fetchEntries: () => Promise<void>;
  addEntry: (data: JournalEntryCreateInput) => Promise<{ success: boolean; error?: string }>;
  updateEntry: (data: JournalEntryUpdateInput) => Promise<{ success: boolean; error?: string }>;
  deleteEntry: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
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
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
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

  updateEntry: async (data) => {
    const parsed = journalEntryUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const res = await fetch("/api/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to update" };
      }

      const updated = await res.json();
      set((state) => ({
        entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
      }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  deleteEntry: async (id) => {
    const parsed = journalEntryDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: "Invalid entry ID" };
    }

    try {
      const res = await fetch("/api/journal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parsed.data.id }),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to delete" };
      }

      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },
}));
