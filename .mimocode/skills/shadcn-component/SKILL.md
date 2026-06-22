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
src/app/[route]/_components/  # Route-specific private components
```

## Reusable patterns

### Selectable card (multi-select, keyboard accessible)
```typescript
"use client";
import * as React from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface SelectableCardProps {
  title: string;
  icon: string;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export default function SelectableCard({ title, icon, selected, onToggle, className }: SelectableCardProps) {
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); }
  }, [onToggle]);

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none",
        "flex flex-col items-center gap-2 text-center",
        "border-border bg-card",
        selected && "border-primary bg-primary/10 shadow-lg shadow-primary/10",
        "hover:border-primary/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {selected && (
        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}
      <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-2xl">{icon}</span>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
}
```

### File upload with preview
```typescript
"use client";
import * as React from "react";
import { cn } from "~/lib/utils";
import { Camera, X } from "lucide-react";

interface FileUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

export default function FileUpload({ value, onChange, className }: FileUploadProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target?.result as string); };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div onClick={() => fileRef.current?.click()}
        className={cn("relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
          value ? "border-primary" : "border-muted-foreground/30 hover:border-primary/50",
        )}>
        {value ? (
          <>
            <img src={value} alt="Upload" className="h-full w-full object-cover" />
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <Camera className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
```

## Common pitfalls

- Always add `"use client"` directive for client components
- Always import `cn` from `~/lib/utils` (not from `clsx` directly)
- Don't use `@/` path alias — use `~/` (maps to `src/`)
- Don't modify files in `src/components/ui/` — these are shadcn-managed
- Use `lucide-react` icons, not `react-icons` (unless already using react-icons)
