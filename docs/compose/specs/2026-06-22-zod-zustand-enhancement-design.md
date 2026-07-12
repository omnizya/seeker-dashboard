# Zod + Zustand Enhancement Design

## [S1] Problem

The seeker-dashboard SaaS currently has:
- **No validation**: API routes use manual `if (!body.field)` checks
- **Scattered state**: 160+ `useState` calls across components
- **No shared state**: Each component manages its own data fetching and state
- **No form validation**: Only HTML `required` attribute, no schema validation

This leads to:
- Inconsistent error handling
- Duplicate type definitions
- Hard-to-test validation logic
- State synchronization issues between components

## [S2] Solution Overview

Add **Zod** for schema validation and **Zustand** for state management using a **schema-first** approach:

1. **Zod schemas** as the single source of truth for:
   - API route validation
   - Form validation
   - TypeScript type inference

2. **Zustand stores** that:
   - Own domain data (bookmarks, journal, etc.)
   - Handle loading/error states
   - Validate inputs via Zod before API calls

3. **Integration pattern**:
   - API routes validate request bodies with Zod
   - Forms call store methods (which validate internally)
   - Server actions validate with Zod before Supabase calls

## [S3] Schema Architecture

### Directory Structure

```
src/
  schemas/
    auth.ts        # login, register schemas
    bookmark.ts    # CRUD schemas
    journal.ts     # entry schemas
    tasbih.ts      # session/preset schemas
    dua.ts         # entry schemas
    index.ts       # re-exports
```

### Schema Examples

**Auth schemas** (`src/schemas/auth.ts`):
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  displayName: z.string().min(2).max(50),
  interests: z.array(z.string()).min(1, "اختر اهتماماً واحداً على الأقل"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Bookmark schemas** (`src/schemas/bookmark.ts`):
```typescript
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
```

**Error messages**: Arabic for user-facing (forms), English for API responses.

## [S4] Zustand Store Patterns

### Directory Structure

```
src/
  stores/
    authStore.ts       # auth state + login/register actions
    bookmarkStore.ts   # bookmarks CRUD
    journalStore.ts    # journal entries CRUD
    tasbihStore.ts     # tasbih sessions/presets
    duaStore.ts        # dua lists/entries
    index.ts           # re-exports
```

### Store Example

**Bookmark store** (`src/stores/bookmarkStore.ts`):
```typescript
import { create } from "zustand";
import { bookmarkCreateSchema, type BookmarkCreateInput } from "~/schemas/bookmark";

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  
  fetchBookmarks: (surahId?: number) => Promise<void>;
  addBookmark: (data: BookmarkCreateInput) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  loading: false,
  error: null,

  fetchBookmarks: async (surahId) => {
    set({ loading: true, error: null });
    try {
      const url = surahId ? `/api/bookmarks?surah_id=${surahId}` : "/api/bookmarks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ bookmarks: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  addBookmark: async (data) => {
    const parsed = bookmarkCreateSchema.safeParse(data);
    if (!parsed.success) {
      set({ error: parsed.error.errors[0].message });
      return;
    }
    
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) throw new Error("Failed to add");
    const bookmark = await res.json();
    set((state) => ({ bookmarks: [bookmark, ...state.bookmarks] }));
  },
}));
```

### Key Patterns

1. **Store owns data + loading/error state**
2. **Zod validates at store level** (forms call store methods)
3. **Components just consume**: `const { bookmarks, loading } = useBookmarkStore()`
4. **Optimistic updates** where appropriate
5. **Error handling** with user-friendly messages

## [S5] Integration Points

### API Routes

Validate request bodies with Zod:

```typescript
// src/app/api/bookmarks/route.ts
import { bookmarkCreateSchema } from "~/schemas/bookmark";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookmarkCreateSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  // Use parsed.data (fully typed)
  const { data, error } = await supabase
    .from("quran_bookmarks")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
}
```

### Forms

Call store methods (which validate internally):

```typescript
// src/app/dashboard/bookmarks/page.tsx
import { useBookmarkStore } from "~/stores/bookmarkStore";

export default function BookmarksPage() {
  const { addBookmark } = useBookmarkStore();
  
  const handleSubmit = async () => {
    await addBookmark({
      ayah_id: Number(formAyahId),
      surah_id: Number(formSurahId),
      ayah_number: Number(formAyahNumber),
      ayah_text: formAyahText,
      label: formLabel || undefined,
      color: formColor || undefined,
    });
  };
}
```

### Server Actions

Validate with Zod before calling Supabase:

```typescript
// src/app/auth/actions.ts
import { loginSchema } from "~/schemas/auth";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  
  // Use parsed.data.email, parsed.data.password
}
```

## [S6] Migration Strategy

Incremental order following user journey priority (register → login → use app):

| Phase | What | Files Changed |
|-------|------|---------------|
| **1** | Install Zod + Zustand | `package.json` |
| **2** | Auth schemas | `src/schemas/auth.ts` (new) |
| **3** | Auth forms + server actions | `register/page.tsx`, `login/page.tsx`, `actions.ts` |
| **4** | Bookmark schemas + store | `src/schemas/bookmark.ts` (new), `src/stores/bookmarkStore.ts` (new) |
| **5** | Bookmark page + API | `bookmarks/page.tsx`, `api/bookmarks/route.ts` |
| **6** | Journal schemas + store | `src/schemas/journal.ts` (new), `src/stores/journalStore.ts` (new) |
| **7** | Journal page + API | `journal/page.tsx`, `api/journal/route.ts` |
| **8** | Tasbih/Dua schemas + stores | `src/schemas/tasbih.ts`, `src/stores/tasbihStore.ts` |
| **9** | Tasbih/Dua pages + APIs | `tasbih/page.tsx`, `dua/page.tsx`, APIs |

Each phase is independently testable. Lint passes after each phase.

## [S7] Success Criteria

1. **Validation**: All API routes use Zod schemas (no manual `if (!body.field)` checks)
2. **Forms**: All forms validate with Zod before submit
3. **State**: Major data domains use Zustand stores (bookmarks, journal, tasbih, dua)
4. **Types**: TypeScript types inferred from Zod schemas (single source of truth)
5. **DX**: Adding new features follows the same pattern (schema → store → page)
6. **Lint**: `bun run lint` passes after each phase

## [S8] Out of Scope

- SWR integration (keeping useEffect + fetch for now)
- Form library (react-hook-form) — using controlled forms with store methods
- Persistent state (localStorage) — can add later if needed
- Server-side state (React Query) — out of scope for this enhancement
