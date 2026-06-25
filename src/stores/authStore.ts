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
