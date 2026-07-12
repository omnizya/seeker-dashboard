# Zod + Zustand Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Zod for schema validation and Zustand for state management using a schema-first approach, incrementally enhancing auth, bookmarks, journal, tasbih, and dua features.

**Architecture:** Zod schemas as single source of truth for API validation, form validation, and TypeScript types. Zustand stores own domain data and handle loading/error states. Forms call store methods which validate internally.

**Tech Stack:** Zod (schema validation), Zustand (state management), Next.js 16, Supabase, TypeScript

---

## Task 1: Install Dependencies

**Covers:** [S2]

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Zod and Zustand**

Run: `bun add zod zustand`

Expected: Dependencies added to package.json

- [ ] **Step 2: Verify installation**

Run: `bun run lint`

Expected: Lint passes (no new errors)

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add zod and zustand dependencies"
```

---

## Task 2: Create Schema Directory and Auth Schemas

**Covers:** [S3]

**Files:**
- Create: `src/schemas/auth.ts`
- Create: `src/schemas/index.ts`

- [ ] **Step 1: Create auth schema**

Create `src/schemas/auth.ts`:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z
  .object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
    displayName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(50),
    interests: z
      .array(z.string())
      .min(1, "اختر اهتماماً واحداً على الأقل"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **Step 2: Create schema index**

Create `src/schemas/index.ts`:

```typescript
export * from "./auth";
```

- [ ] **Step 3: Verify types compile**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/schemas/
git commit -m "feat: add Zod schemas for auth (login, register)"
```

---

## Task 3: Create Auth Store

**Covers:** [S4]

**Files:**
- Create: `src/stores/authStore.ts`
- Create: `src/stores/index.ts`

- [ ] **Step 1: Create auth store**

Create `src/stores/authStore.ts`:

```typescript
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (data) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
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
    } catch (e) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  register: async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("email", parsed.data.email);
      formData.append("password", parsed.data.password);
      formData.append("displayName", parsed.data.displayName);
      formData.append("interests", JSON.stringify(parsed.data.interests));

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        set({ loading: false });
        return { success: false, error: result.error || "Registration failed" };
      }

      set({ loading: false });
      return { success: true };
    } catch (e) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
```

- [ ] **Step 2: Create stores index**

Create `src/stores/index.ts`:

```typescript
export * from "./authStore";
```

- [ ] **Step 3: Verify types compile**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand auth store with Zod validation"
```

---

## Task 4: Update Auth Server Actions

**Covers:** [S5]

**Files:**
- Modify: `src/app/auth/actions.ts`

- [ ] **Step 1: Read current actions file**

Read `src/app/auth/actions.ts` to understand current structure.

- [ ] **Step 2: Add Zod validation to login action**

Update `src/app/auth/actions.ts` to use Zod:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { loginSchema, registerSchema } from "~/schemas/auth";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("password"), // Same as password for server
    displayName: formData.get("displayName") || "User",
    interests: JSON.parse((formData.get("interests") as string) || "[]"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        interests: parsed.data.interests,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
```

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/actions.ts
git commit -m "feat: add Zod validation to auth server actions"
```

---

## Task 5: Update Login Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/auth/login/page.tsx`

- [ ] **Step 1: Read current login page**

Read `src/app/auth/login/page.tsx` to understand current structure.

- [ ] **Step 2: Update login page to use store**

Update `src/app/auth/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuthStore } from "~/stores/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await login({ email, password });

    if (result.success) {
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات حسابك</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري التسجيل..." : "تسجيل الدخول"}
            </Button>
            <Link href="/auth/register" className="text-sm text-muted-foreground hover:underline">
              ليس لديك حساب؟ سجل الآن
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "feat: update login page to use Zustand store"
```

---

## Task 6: Update Register Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/auth/register/page.tsx`

- [ ] **Step 1: Read current register page**

Read `src/app/auth/register/page.tsx` to understand current structure.

- [ ] **Step 2: Update register page to use store**

Update `src/app/auth/register/page.tsx` to use `useAuthStore` and simplify state management. The register page currently has 8+ useState calls — consolidate into the store.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/register/page.tsx
git commit -m "feat: update register page to use Zustand store"
```

---

## Task 7: Create Bookmark Schemas and Store

**Covers:** [S3, S4]

**Files:**
- Create: `src/schemas/bookmark.ts`
- Create: `src/stores/bookmarkStore.ts`
- Modify: `src/schemas/index.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create bookmark schema**

Create `src/schemas/bookmark.ts`:

```typescript
import { z } from "zod";

export const bookmarkCreateSchema = z.object({
  ayah_id: z.number().int().positive(),
  surah_id: z.number().int().positive(),
  ayah_number: z.number().int().positive(),
  ayah_text: z.string().min(1),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const bookmarkDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type BookmarkCreateInput = z.infer<typeof bookmarkCreateSchema>;
export type BookmarkDeleteInput = z.infer<typeof bookmarkDeleteSchema>;
```

- [ ] **Step 2: Create bookmark store**

Create `src/stores/bookmarkStore.ts`:

```typescript
import { create } from "zustand";
import {
  bookmarkCreateSchema,
  bookmarkDeleteSchema,
  type BookmarkCreateInput,
} from "~/schemas/bookmark";

interface Bookmark {
  id: string;
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
  deleteBookmark: (id: string) => Promise<{ success: boolean; error?: string }>;
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
      return { success: false, error: parsed.error.errors[0].message };
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
    } catch (e) {
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
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },
}));
```

- [ ] **Step 3: Update schema and store indexes**

Update `src/schemas/index.ts`:

```typescript
export * from "./auth";
export * from "./bookmark";
```

Update `src/stores/index.ts`:

```typescript
export * from "./authStore";
export * from "./bookmarkStore";
```

- [ ] **Step 4: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 5: Commit**

```bash
git add src/schemas/bookmark.ts src/stores/bookmarkStore.ts src/schemas/index.ts src/stores/index.ts
git commit -m "feat: add Zod schemas and Zustand store for bookmarks"
```

---

## Task 8: Update Bookmarks API

**Covers:** [S5]

**Files:**
- Modify: `src/app/api/bookmarks/route.ts`

- [ ] **Step 1: Read current bookmarks API**

Read `src/app/api/bookmarks/route.ts` to understand current structure.

- [ ] **Step 2: Add Zod validation to POST**

Update `src/app/api/bookmarks/route.ts` POST handler:

```typescript
import { bookmarkCreateSchema } from "~/schemas/bookmark";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookmarkCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .schema("spiritual")
      .from("quran_bookmarks")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Bookmarks create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Add Zod validation to DELETE**

Update `src/app/api/bookmarks/route.ts` DELETE handler:

```typescript
import { bookmarkDeleteSchema } from "~/schemas/bookmark";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookmarkDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .schema("spiritual")
      .from("quran_bookmarks")
      .select("id, user_id")
      .eq("id", parsed.data.id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .schema("spiritual")
      .from("quran_bookmarks")
      .delete()
      .eq("id", parsed.data.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmarks delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 5: Commit**

```bash
git add src/app/api/bookmarks/route.ts
git commit -m "feat: add Zod validation to bookmarks API routes"
```

---

## Task 9: Update Bookmarks Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/dashboard/bookmarks/page.tsx`

- [ ] **Step 1: Read current bookmarks page**

Read `src/app/dashboard/bookmarks/page.tsx` to understand current structure.

- [ ] **Step 2: Update page to use store**

Replace useState + useEffect with `useBookmarkStore`. The page currently has 8+ state variables — consolidate into the store.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/bookmarks/page.tsx
git commit -m "feat: update bookmarks page to use Zustand store"
```

---

## Task 10: Create Journal Schemas and Store

**Covers:** [S3, S4]

**Files:**
- Create: `src/schemas/journal.ts`
- Create: `src/stores/journalStore.ts`
- Modify: `src/schemas/index.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create journal schema**

Create `src/schemas/journal.ts`:

```typescript
import { z } from "zod";

export const journalEntryCreateSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(200),
  content: z.string().min(1, "المحتوى مطلوب"),
  mood: z.enum(["happy", "neutral", "sad", "grateful", "anxious"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const journalEntryUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  mood: z.enum(["happy", "neutral", "sad", "grateful", "anxious"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const journalEntryDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>;
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>;
```

- [ ] **Step 2: Create journal store**

Create `src/stores/journalStore.ts`:

```typescript
import { create } from "zustand";
import {
  journalEntryCreateSchema,
  journalEntryUpdateSchema,
  journalEntryDeleteSchema,
  type JournalEntryCreateInput,
  type JournalEntryUpdateInput,
} from "~/schemas/journal";

interface JournalEntry {
  id: string;
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
  deleteEntry: (id: string) => Promise<{ success: boolean; error?: string }>;
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
      return { success: false, error: parsed.error.errors[0].message };
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
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },

  updateEntry: async (data) => {
    const parsed = journalEntryUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
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
    } catch (e) {
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
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },
}));
```

- [ ] **Step 3: Update indexes**

Update `src/schemas/index.ts`:

```typescript
export * from "./auth";
export * from "./bookmark";
export * from "./journal";
```

Update `src/stores/index.ts`:

```typescript
export * from "./authStore";
export * from "./bookmarkStore";
export * from "./journalStore";
```

- [ ] **Step 4: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 5: Commit**

```bash
git add src/schemas/journal.ts src/stores/journalStore.ts src/schemas/index.ts src/stores/index.ts
git commit -m "feat: add Zod schemas and Zustand store for journal"
```

---

## Task 11: Update Journal API

**Covers:** [S5]

**Files:**
- Modify: `src/app/api/journal/route.ts`

- [ ] **Step 1: Read current journal API**

Read `src/app/api/journal/route.ts` to understand current structure.

- [ ] **Step 2: Add Zod validation to all handlers**

Update POST, PUT, DELETE handlers with Zod validation using `journalEntryCreateSchema`, `journalEntryUpdateSchema`, `journalEntryDeleteSchema`.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/api/journal/route.ts
git commit -m "feat: add Zod validation to journal API routes"
```

---

## Task 12: Update Journal Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/dashboard/journal/page.tsx`

- [ ] **Step 1: Read current journal page**

Read `src/app/dashboard/journal/page.tsx` to understand current structure.

- [ ] **Step 2: Update page to use store**

Replace useState + useEffect with `useJournalStore`.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/journal/page.tsx
git commit -m "feat: update journal page to use Zustand store"
```

---

## Task 13: Create Tasbih Schemas and Store

**Covers:** [S3, S4]

**Files:**
- Create: `src/schemas/tasbih.ts`
- Create: `src/stores/tasbihStore.ts`
- Modify: `src/schemas/index.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create tasbih schema**

Create `src/schemas/tasbih.ts`:

```typescript
import { z } from "zod";

export const tasbihPresetCreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  target: z.number().int().positive().max(10000),
  dhikr: z.string().min(1, "الذكر مطلوب"),
});

export const tasbihSessionCreateSchema = z.object({
  preset_id: z.string().uuid(),
  count: z.number().int().min(0),
});

export type TasbihPresetCreateInput = z.infer<typeof tasbihPresetCreateSchema>;
export type TasbihSessionCreateInput = z.infer<typeof tasbihSessionCreateSchema>;
```

- [ ] **Step 2: Create tasbih store**

Create `src/stores/tasbihStore.ts` with fetchPresets, addPreset, fetchSessions, addSession methods using Zod validation.

- [ ] **Step 3: Update indexes**

Add exports to `src/schemas/index.ts` and `src/stores/index.ts`.

- [ ] **Step 4: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 5: Commit**

```bash
git add src/schemas/tasbih.ts src/stores/tasbihStore.ts src/schemas/index.ts src/stores/index.ts
git commit -m "feat: add Zod schemas and Zustand store for tasbih"
```

---

## Task 14: Update Tasbih API and Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/api/tasbih/route.ts`
- Modify: `src/app/dashboard/tasbih/page.tsx`

- [ ] **Step 1: Add Zod validation to tasbih API**

Update API routes with Zod validation.

- [ ] **Step 2: Update tasbih page to use store**

Replace useState + useEffect with `useTasbihStore`.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/api/tasbih/route.ts src/app/dashboard/tasbih/page.tsx
git commit -m "feat: update tasbih API and page with Zod/Zustand"
```

---

## Task 15: Create Dua Schemas and Store

**Covers:** [S3, S4]

**Files:**
- Create: `src/schemas/dua.ts`
- Create: `src/stores/duaStore.ts`
- Modify: `src/schemas/index.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create dua schema**

Create `src/schemas/dua.ts`:

```typescript
import { z } from "zod";

export const duaListCreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  category: z.string().optional(),
});

export const duaEntryCreateSchema = z.object({
  list_id: z.string().uuid(),
  title: z.string().min(1, "العنوان مطلوب").max(200),
  content: z.string().min(1, "المحتوى مطلوب"),
  arabic_text: z.string().optional(),
});

export type DuaListCreateInput = z.infer<typeof duaListCreateSchema>;
export type DuaEntryCreateInput = z.infer<typeof duaEntryCreateSchema>;
```

- [ ] **Step 2: Create dua store**

Create `src/stores/duaStore.ts` with fetchLists, addList, fetchEntries, addEntry methods using Zod validation.

- [ ] **Step 3: Update indexes**

Add exports to `src/schemas/index.ts` and `src/stores/index.ts`.

- [ ] **Step 4: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 5: Commit**

```bash
git add src/schemas/dua.ts src/stores/duaStore.ts src/schemas/index.ts src/stores/index.ts
git commit -m "feat: add Zod schemas and Zustand store for dua"
```

---

## Task 16: Update Dua API and Page

**Covers:** [S5]

**Files:**
- Modify: `src/app/api/dua/route.ts`
- Modify: `src/app/dashboard/dua/page.tsx`

- [ ] **Step 1: Add Zod validation to dua API**

Update API routes with Zod validation.

- [ ] **Step 2: Update dua page to use store**

Replace useState + useEffect with `useDuaStore`.

- [ ] **Step 3: Verify lint passes**

Run: `bun run lint`

Expected: Lint passes

- [ ] **Step 4: Commit**

```bash
git add src/app/api/dua/route.ts src/app/dashboard/dua/page.tsx
git commit -m "feat: update dua API and page with Zod/Zustand"
```

---

## Task 17: Final Verification

**Covers:** [S7]

**Files:**
- None (verification only)

- [ ] **Step 1: Run full lint**

Run: `bun run lint`

Expected: Lint passes with no errors

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`

Expected: No type errors

- [ ] **Step 3: Verify all schemas exist**

Check that `src/schemas/` contains: auth.ts, bookmark.ts, journal.ts, tasbih.ts, dua.ts, index.ts

- [ ] **Step 4: Verify all stores exist**

Check that `src/stores/` contains: authStore.ts, bookmarkStore.ts, journalStore.ts, tasbihStore.ts, duaStore.ts, index.ts

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Zod + Zustand enhancement"
```
