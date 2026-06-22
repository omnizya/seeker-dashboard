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
      const formData = new FormData();
      formData.append("email", parsed.data.email);
      formData.append("password", parsed.data.password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        set({ loading: false });
        return { success: false, error: result.error || "Login failed" };
      }

      set({ loading: false });
      return { success: true };
    } catch {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  register: async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    set({ loading: true, error: null });
    try {
      const { signup } = await import("~/app/auth/actions");
      const formData = new FormData();
      formData.append("email", parsed.data.email);
      formData.append("password", parsed.data.password);
      formData.append("displayName", parsed.data.displayName);
      formData.append("interests", JSON.stringify(parsed.data.interests));

      const result = await signup(formData);
      if (result?.error) {
        set({ loading: false });
        return { success: false, error: result.error };
      }

      set({ loading: false });
      return { success: true };
    } catch {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
}));
