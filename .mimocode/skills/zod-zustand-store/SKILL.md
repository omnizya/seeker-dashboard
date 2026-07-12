---
name: zod-zustand-store
description: Create Zustand stores with Zod validation following the project's schema-first pattern. Covers schemas, stores, API routes, and page integration.
---

# Zod + Zustand Store

Create domain stores with Zod validation following the project's schema-first approach: Zod schemas as single source of truth, Zustand stores own data + loading/error, forms call store methods.

## When to use

- User says "add store", "create state management", "add validation"
- Need Zustand store for a new domain (CRUD operations)
- Need Zod schemas for API validation and form validation
- Migrating from useState + useEffect to centralized state

## Workflow

### Step 1 — Create Zod schemas

Create `src/schemas/[domain].ts`:

```typescript
import { z } from "zod";

// Arabic error messages for user-facing validation
export const [domain]CreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  // ... other fields
});

export const [domain]DeleteSchema = z.object({
  id: z.string().uuid(),
});

export type [Domain]CreateInput = z.infer<typeof [domain]CreateSchema>;
export type [Domain]DeleteInput = z.infer<typeof [domain]DeleteSchema>;
```

**Important:** Zod v4 uses `.error.issues[0].message` not `.error.errors[0].message`.

### Step 2 — Create Zustand store

Create `src/stores/[domain]Store.ts`:

```typescript
import { create } from "zustand";
import {
  [domain]CreateSchema,
  [domain]DeleteSchema,
  type [Domain]CreateInput,
} from "~/schemas/[domain]";

interface [Domain] {
  id: string;
  // ... fields matching your DB schema
  created_at: string;
}

interface [Domain]State {
  items: [Domain][];
  loading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  addItem: (data: [Domain]CreateInput) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const use[Domain]Store = create<[Domain]State>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/[domain]");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ items: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addItem: async (data) => {
    const parsed = [domain]CreateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    try {
      const res = await fetch("/api/[domain]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to add" };
      }

      const item = await res.json();
      set((state) => ({ items: [item, ...state.items] }));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },

  deleteItem: async (id) => {
    const parsed = [domain]DeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: "Invalid ID" };
    }

    try {
      const res = await fetch("/api/[domain]", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parsed.data.id }),
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, error: result.error || "Failed to delete" };
      }

      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },
}));
```

### Step 3 — Update barrel exports

Update `src/schemas/index.ts`:
```typescript
export * from "./[domain]";
```

Update `src/stores/index.ts`:
```typescript
export * from "./[domain]Store";
```

### Step 4 — Add Zod validation to API route

Update `src/app/api/[domain]/route.ts`:

```typescript
import { [domain]CreateSchema } from "~/schemas/[domain]";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = [domain]CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Use parsed.data (fully typed)
  const { data, error } = await supabase
    .from("[table_name]")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
}
```

### Step 5 — Update page to use store

Replace useState + useEffect with store:

```typescript
"use client";
import { use[Domain]Store } from "~/stores/[domain]Store";

export default function [Domain]Page() {
  const { items, loading, error, fetchItems, addItem, deleteItem } = use[Domain]Store();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async () => {
    await addItem({ name: formName, /* ... */ });
  };

  // ... render
}
```

### Step 6 — Verify and commit

```bash
bun run lint
git add src/schemas/ src/stores/ src/app/api/[domain]/ src/app/dashboard/[domain]/
git commit -m "feat: add Zod schemas and Zustand store for [domain]"
```

## Store pattern reference

All domain stores follow identical structure:
- **State**: `items`, `loading`, `error`
- **Methods**: `fetchItems`, `addItem`, `deleteItem` (optional: `updateItem`)
- **Validation**: Zod `safeParse` before API calls
- **Updates**: Optimistic state updates
- **Return**: `{ success: boolean; error?: string }`

## Barrel exports

Always update both index files:
- `src/schemas/index.ts` — re-export all schemas
- `src/stores/index.ts` — re-export all stores

## Common pitfalls

- Use `.error.issues[0].message` not `.error.errors[0].message` (Zod v4)
- Use `.error.flatten()` for structured error details in API responses
- Arabic error messages for user-facing validation, English for API errors
- Auth store may need to call server actions instead of API routes (dynamic import)
- Store types may need updating if DB schema has more fields than expected
