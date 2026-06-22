import { create } from "zustand";
import {
  bookmarkCreateSchema,
  bookmarkDeleteSchema,
  type BookmarkCreateInput,
} from "~/schemas/bookmark";

interface Bookmark {
  id: number;
  ayah_id: number;
  surah_id: number;
  ayah_number: number;
  ayah_text: string;
  label?: string;
  color?: string;
  created_at: string;
}

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
      const url = surahId
        ? `/api/bookmarks?surah_id=${surahId}`
        : "/api/bookmarks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
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
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const bookmark = await res.json();
      set((state) => ({ bookmarks: [bookmark, ...state.bookmarks] }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  deleteBookmark: async (id) => {
    const parsed = bookmarkDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: "Invalid bookmark ID" };
    }

    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parsed.data.id }),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to delete" };
      }

      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }));
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },
}));
