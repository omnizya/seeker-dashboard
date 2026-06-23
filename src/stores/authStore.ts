import { create } from "zustand";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "~/schemas/auth";

interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
  error: string | null;

  login: (data: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: { id: string; email: string } | null) => void;
  setError: (error: string | null) => void;
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = await res.json();

      if (!res.ok) {
        set({ loading: false });
        return { success: false, error: result.error || "فشل تسجيل الدخول" };
      }

      set({ loading: false });
      return { success: true };
    } catch {
      set({ loading: false, error: "خطأ في الشبكة" });
      return { success: false, error: "خطأ في الشبكة" };
    }
  },

  register: async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    set({ loading: true, error: null });
    try {
      const { register } = await import("~/app/auth/actions");

      const result = await register({
        email: parsed.data.email,
        password: parsed.data.password,
        confirmPassword: parsed.data.password,
        displayName: parsed.data.displayName,
        interests: parsed.data.interests,
      });
      if (result?.error) {
        set({ loading: false });
        return { success: false, error: result.error };
      }

      set({ loading: false });
      return { success: true };
    } catch {
      set({ loading: false, error: "خطأ في الشبكة" });
      return { success: false, error: "خطأ في الشبكة" };
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
}));
