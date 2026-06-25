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
