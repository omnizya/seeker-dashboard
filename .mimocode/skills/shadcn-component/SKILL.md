---
name: shadcn-component
description: Create React components using shadcn/ui, Tailwind CSS, and the cn() utility. Follows the project's established patterns.
---

# shadcn/ui Component

Create React components following the project's established patterns: shadcn/ui primitives, Tailwind CSS, "use client" directive, cn() utility.

## When to use

- User says "create component", "add UI component", "build widget"
- Need React components with shadcn/ui
- Need Tailwind-styled components
- Need client-side interactive components

## Workflow

### Step 1 — Create component file

Create in `src/components/[Category]/[ComponentName].tsx`:

```typescript
"use client";

import { cn } from "~/lib/utils";

interface ComponentNameProps {
  // Define props with TypeScript types
  variant?: "default" | "secondary";
  className?: string;
}

export function ComponentName({
  variant = "default",
  className,
}: ComponentNameProps) {
  return (
    <div className={cn("base-classes", variant === "secondary" && "secondary-classes", className)}>
      {/* Content */}
    </div>
  );
}
```

### Step 2 — Use shadcn/ui primitives

Import from `~/components/ui/`:
- `Button` — `import { Button } from "~/components/ui/button"`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` — `import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"`
- `Input` — `import { Input } from "~/components/ui/input"`
- `Badge` — `import { Badge } from "~/components/ui/badge"`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — from `~/components/ui/table"`

### Step 3 — Use Tailwind for styling

```typescript
// Good patterns
<div className="flex items-center gap-2 p-4">
<div className="grid grid-cols-3 gap-2">
<div className="text-sm text-muted-foreground">
<div className="bg-brand-500 text-white rounded-lg">

// Use dark: variants
<div className="bg-white dark:bg-gray-800">

// Use responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-3">
```

### Step 4 — Use cn() for conditional classes

```typescript
import { cn } from "~/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class",
  variant === "secondary" && "variant-class",
  className  // Allow external overrides
)}>
```

### Step 5 — Export and document

```typescript
// Named export (preferred)
export function ComponentName({ ... }: ComponentNameProps) { ... }

// Or default export for pages
export default function PageComponent() { ... }
```

### Step 6 — Verify and commit

```bash
bun run lint
git add src/components/
git commit -m "feat: add [ComponentName] component"
```

## Component patterns

### Display component (no state)
```typescript
"use client";
import { cn } from "~/lib/utils";

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function Badge({ label, color = "bg-gray-500", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", className)}>
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {label}
    </span>
  );
}
```

### Interactive component (with state)
```typescript
"use client";
import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";

interface ToggleProps {
  onToggle: (value: boolean) => void;
  className?: string;
}

export function Toggle({ onToggle, className }: ToggleProps) {
  const [active, setActive] = useState(false);

  const handleClick = useCallback(() => {
    const next = !active;
    setActive(next);
    onToggle(next);
  }, [active, onToggle]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-4 py-2 rounded-lg transition-colors",
        active ? "bg-brand-500 text-white" : "bg-muted",
        className
      )}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
```

### Page component (Next.js App Router)
```typescript
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function PageName() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Page Title</h1>
      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Click me</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## File organization

```
src/components/
  ui/           # shadcn/ui primitives (don't modify directly)
  Lodge/        # Lodge Protocol components
  Dashboard/    # Dashboard-specific components
  Layout/       # Layout components (Navbar, Footer, Sidebar)
```

## Common pitfalls

- Always add `"use client"` directive for client components
- Always import `cn` from `~/lib/utils` (not from `clsx` directly)
- Don't use `@/` path alias — use `~/` (maps to `src/`)
- Don't modify files in `src/components/ui/` — these are shadcn-managed
- Use `lucide-react` icons, not `react-icons` (unless already using react-icons)
