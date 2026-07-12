# Auth Design System — SP1: Design Tokens + Base Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the visual foundation — CSS variables, typography, and 5 base components with the cosmic dark theme.

**Architecture:** Modify existing globals.css dark mode variables to match the brand palette. Add Cormorant Garamond and JetBrains Mono fonts. Update Button, Input, Card, Badge components with new color tokens.

**Tech Stack:** Tailwind CSS v3, shadcn/ui, class-variance-authority, Google Fonts

---

## Task 1: Update CSS Variables

**Covers:** [S3]

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace dark mode CSS variables**

Replace the `.dark` block in `src/app/globals.css` with:

```css
.dark {
  --background: 222 40% 6%;
  --foreground: 210 40% 96%;
  --card: 222 35% 10%;
  --card-foreground: 210 40% 96%;
  --popover: 222 35% 10%;
  --popover-foreground: 210 40% 96%;
  --primary: 258 90% 66%;
  --primary-foreground: 0 0% 100%;
  --secondary: 256 60% 85%;
  --secondary-foreground: 258 90% 66%;
  --muted: 222 30% 12%;
  --muted-foreground: 215 20% 65%;
  --accent: 258 50% 20%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62% 50%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 70% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --gold: 43 88% 57%;
  --gold-foreground: 222 40% 6%;
  --border: 222 20% 12%;
  --input: 222 20% 12%;
  --ring: 258 90% 66%;
  --radius: 0.75rem;
}
```

Also add the light mode `:root` block update:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 40% 6%;
  --card: 0 0% 100%;
  --card-foreground: 222 40% 6%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 40% 6%;
  --primary: 258 90% 66%;
  --primary-foreground: 0 0% 100%;
  --secondary: 256 60% 85%;
  --secondary-foreground: 258 90% 66%;
  --muted: 210 20% 96%;
  --muted-foreground: 215 20% 65%;
  --accent: 256 60% 92%;
  --accent-foreground: 258 90% 50%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 70% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --gold: 43 88% 57%;
  --gold-foreground: 222 40% 6%;
  --border: 214 20% 90%;
  --input: 214 20% 90%;
  --ring: 258 90% 66%;
  --radius: 0.75rem;
}
```

- [ ] **Step 2: Verify build**

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update CSS variables with cosmic dark theme tokens"
```

---

## Task 2: Add Fonts

**Covers:** [S4]

**Files:**
- Modify: `src/styles/fonts.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update fonts.tsx with Cormorant Garamond and JetBrains Mono**

Replace the entire content of `src/styles/fonts.tsx`:

```tsx
"use client";

const Fonts = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    @font-face {
        font-family: "Uthman";
        font-display: swap;
        src: url(https://quran.com/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2)
          format("woff2");
      }
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
    `,
    }}
  />
);

export default Fonts;
```

- [ ] **Step 2: Update tailwind.config.ts with new font families**

In `tailwind.config.ts`, update the `fontFamily` section:

```typescript
fontFamily: {
  uthman: ["Uthman", "serif"],
  heading: ["Cormorant Garamond", "serif"],
  sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
},
```

Also add the `gold` color to the `colors` section (it already exists in the config, just verify it's there).

- [ ] **Step 3: Verify build**

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/styles/fonts.tsx tailwind.config.ts
git commit -m "feat: add Cormorant Garamond and JetBrains Mono fonts"
```

---

## Task 3: Update Button Component

**Covers:** [S6]

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Add gold variant to button**

In `src/components/ui/button.tsx`, add the `gold` variant to the `buttonVariants` CVA:

```typescript
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  gold: "bg-gold text-gold-foreground hover:bg-gold/90 font-semibold",
},
```

- [ ] **Step 2: Verify build**

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: add gold variant to Button component"
```

---

## Task 4: Update Badge Component

**Covers:** [S6]

**Files:**
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Add gold variant to badge**

In `src/components/ui/badge.tsx`, add the `gold` variant:

```typescript
variant: {
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground",
  gold: "border-transparent bg-gold text-gold-foreground hover:bg-gold/80",
},
```

- [ ] **Step 2: Verify build**

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: add gold variant to Badge component"
```

---

## Task 5: Verify Full Build

**Covers:** [S3, S4, S6]

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

Run: `bun run lint 2>&1 | tail -5`
Expected: 0 errors

- [ ] **Step 2: Run build**

Run: `bun run build 2>&1 | tail -10`
Expected: Build succeeds, all pages generated

- [ ] **Step 3: Visual check — dark mode variables applied**

Run: `grep -c "gold" src/app/globals.css`
Expected: At least 4 (gold and gold-foreground in both light and dark)
