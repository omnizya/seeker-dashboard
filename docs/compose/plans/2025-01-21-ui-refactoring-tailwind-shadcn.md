# UI Refactoring: Tailwind + shadcn/ui + daisyUI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Chakra UI with Tailwind CSS + shadcn/ui + daisyUI across the entire application, adding dark mode support and preserving Arabic RTL layout.

**Architecture:** Incremental migration — install Tailwind/shadcn alongside Chakra, migrate component by component in 5 phases, remove Chakra last. shadcn for interactive components, daisyUI for display-only utilities, raw Tailwind for layout.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v3, shadcn/ui, daisyUI, next-themes, lucide-react, class-variance-authority, tailwind-merge, Bun

**RTL:** Arabic-first (dir="rtl" on html). All new code uses Tailwind `rtl:` variants and shadcn logical properties.

**Verification:** No test suite exists. Verify via `bun run lint`, `bun run check:unused`, and `bun run build`.

---

## Phase 1: Foundation

### Task 1: Install Tailwind CSS properly

**Covers:** [S3, S4]
**Files:**
- Create: `src/app/globals.css`
- Modify: `postcss.config.js`

- [ ] **Step 1: Install Tailwind CSS**

```bash
bun add -d tailwindcss
```

- [ ] **Step 2: Create globals.css with Tailwind directives**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Verify PostCSS config**

Read `postcss.config.js` — should already have `tailwindcss: {}` and `autoprefixer: {}`. No changes needed.

- [ ] **Step 4: Run lint to verify no breakage**

```bash
bun run lint
```

Expected: PASS (no Chakra changes yet)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "chore: add Tailwind CSS globals.css with base directives"
```

---

### Task 2: Create Tailwind config with brand tokens

**Covers:** [S5]
**Files:**
- Create: `tailwind.config.ts`

- [ ] **Step 1: Create tailwind.config.ts**

Create `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        uthman: ["Uthman", "serif"],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
  },
};

export default config;
```

- [ ] **Step 2: Update globals.css to import fonts**

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 60 9.1% 97.8%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --ring: 24.6 95% 53.1%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 60 9.1% 97.8%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --ring: 24.6 95% 53.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    min-height: 100vh;
  }
  html {
    scroll-behavior: smooth;
  }
}
```

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure Tailwind with brand tokens, CSS variables, and daisyUI"
```

---

### Task 3: Initialize shadcn/ui

**Covers:** [S3, S4]
**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/app/globals.css` (append shadcn theme variables)
- Modify: `tailwind.config.ts` (add shadcn theme extensions)

- [ ] **Step 1: Install shadcn dependencies**

```bash
bun add class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Create src/lib/utils.ts**

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
bunx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config location: `tailwind.config.ts`
- Global CSS location: `src/app/globals.css`
- src directory: `./src`
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

- [ ] **Step 4: Update tailwind.config.ts for shadcn compatibility**

The init may overwrite parts of `tailwind.config.ts`. Ensure it includes:
- `darkMode: ["class"]`
- `content` paths covering `src/`
- shadcn color variables in `theme.extend.colors`
- The `daisyui` plugin
- The `font-uthman` family

- [ ] **Step 5: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components.json src/lib/utils.ts tailwind.config.ts src/app/globals.css
git commit -m "feat: initialize shadcn/ui with CSS variables and utility function"
```

---

### Task 4: Install shadcn/ui components

**Covers:** [S8]
**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/tooltip.tsx`

- [ ] **Step 1: Install all shadcn/ui components**

```bash
bunx shadcn@latest add button card input label table avatar dropdown-menu sheet badge textarea separator skeleton tooltip
```

- [ ] **Step 2: Verify components exist**

```bash
ls src/components/ui/
```

Expected: All 13 files listed above

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: install shadcn/ui component library"
```

---

### Task 5: Wire up next-themes for dark mode

**Covers:** [S5]
**Files:**
- Modify: `src/providers.tsx`

- [ ] **Step 1: Update providers.tsx with ThemeProvider**

Replace the contents of `src/providers.tsx`:

```typescript
"use client";

import { ThemeProvider } from "next-themes";
import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";
import { Fonts } from "./styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { theme } from "./styles/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Fonts />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
```

Note: ChakraProvider stays temporarily until all components are migrated.

- [ ] **Step 2: Update layout.tsx to import globals.css**

Read `src/app/layout.tsx`. Add the import at the top:

```typescript
import "./globals.css";
```

Ensure the import appears before any other CSS-related imports.

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/providers.tsx src/app/layout.tsx
git commit -m "feat: wire up next-themes and import Tailwind globals"
```

---

## Phase 2: Layout Shell

### Task 6: Refactor Navbar

**Covers:** [S7]
**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Read current Navbar**

Read `src/components/Navbar.tsx` to understand the current structure.

- [ ] **Step 2: Rewrite Navbar with shadcn + Tailwind**

Replace the Navbar component. The new version uses:
- shadcn `DropdownMenu` for the user menu
- shadcn `Avatar` for the user avatar
- Tailwind flex utilities for layout
- `lucide-react` icons (Menu, X, Bell, LogOut, User)
- `rtl:` Tailwind variants for RTL support

Key structural changes:
- Remove all Chakra imports (`Box`, `Flex`, `HStack`, `Stack`, `Menu`, `IconButton`, `Avatar`)
- Replace with `<div className="flex items-center ...">` patterns
- Replace `useDisclosure` with React `useState`
- Replace Chakra icons with lucide-react equivalents

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "refactor: migrate Navbar from Chakra to shadcn/ui + Tailwind"
```

---

### Task 7: Refactor Sidebar

**Covers:** [S7]
**Files:**
- Modify: `src/components/AlefpageSection/SideBar/page.tsx`

- [ ] **Step 1: Read current Sidebar**

Read the sidebar component to understand nav items, avatar, mobile drawer pattern.

- [ ] **Step 2: Rewrite Sidebar with shadcn Sheet + Tailwind**

Replace the sidebar. The new version uses:
- shadcn `Sheet` for mobile drawer (replaces Chakra `Drawer`)
- Tailwind flex for sidebar layout
- `lucide-react` icons for nav items
- shadcn `Avatar` for user display
- CSS variables for sidebar background colors

Key structural changes:
- Remove Chakra `Drawer`, `DrawerContent`, `Menu`, `MenuButton`, `MenuItem`, `MenuList`
- Mobile nav: `Sheet` with `side="start"` (RTL: `side="end"`)
- Desktop nav: fixed `<aside>` with Tailwind classes
- Nav items: `<a>` or Next.js `<Link>` with Tailwind hover states

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/AlefpageSection/SideBar/page.tsx
git commit -m "refactor: migrate Sidebar from Chakra Drawer to shadcn Sheet + Tailwind"
```

---

### Task 8: Refactor Footers

**Covers:** [S7]
**Files:**
- Modify: `src/components/Footer/index.tsx`
- Modify: `src/components/Footer/appFooter.tsx`

- [ ] **Step 1: Read current Footer files**

Read both footer components to understand structure.

- [ ] **Step 2: Rewrite Footer/index.tsx**

Replace with Tailwind grid layout:
- Remove Chakra `SimpleGrid`, `Container`, `chakra.button`, `VisuallyHidden`
- Use `grid grid-cols-1 md:grid-cols-3 gap-8`
- shadcn `Input` for email subscription
- shadcn `Button` for subscribe action
- `sr-only` class instead of `VisuallyHidden`

- [ ] **Step 3: Rewrite Footer/appFooter.tsx**

Simplify to Tailwind flex row:
- Logo + copyright on one side, social links on the other
- `flex flex-col md:flex-row items-center justify-between`

- [ ] **Step 4: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer/
git commit -m "refactor: migrate Footers from Chakra to Tailwind + shadcn"
```

---

### Task 9: Update layout files

**Covers:** [S7]
**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Review layout files**

Read both layout files to check for any Chakra-specific wrappers.

- [ ] **Step 2: Update root layout if needed**

Ensure `src/app/layout.tsx`:
- Imports `globals.css`
- Has `className` on body for Tailwind (not Chakra style props)
- Keeps `<html lang="ar" dir="rtl">`

- [ ] **Step 3: Update dashboard layout if needed**

Ensure `src/app/dashboard/layout.tsx` works with the new Sidebar component.

- [ ] **Step 4: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/dashboard/layout.tsx
git commit -m "refactor: update layout files for Tailwind compatibility"
```

---

## Phase 3: Core Dashboard Components

### Task 10: Refactor JummalCard

**Covers:** [S7]
**Files:**
- Modify: `src/components/JummalCard/Jummal.tsx`

- [ ] **Step 1: Read current JummalCard**

Read the component to understand input/output pattern.

- [ ] **Step 2: Rewrite JummalCard**

Replace with:
- shadcn `Card`, `CardHeader`, `CardContent`
- shadcn `Textarea` for input
- shadcn `Table` for results (or native `<table>` with Tailwind stripes)
- shadcn `Badge` for stat values
- Remove Chakra `Card`, `CardBody`, `CardHeader`, `Textarea`, `Table`, `Stat`, `StatNumber`, `Tag`

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/JummalCard/
git commit -m "refactor: migrate JummalCard from Chakra to shadcn/ui"
```

---

### Task 11: Refactor HolyNames

**Covers:** [S7]
**Files:**
- Modify: `src/components/HolyNames.tsx`

- [ ] **Step 1: Read current HolyNames**

Read the component to understand data fetching and table structure.

- [ ] **Step 2: Rewrite HolyNames**

Replace with:
- shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- daisyUI `badge` class for tag display
- Tailwind for layout and spacing
- Remove Chakra `Table`, `Thead`, `Tbody`, `Th`, `Td`, `Tr`, `Tag`, `Stat`, `StatNumber`

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/HolyNames.tsx
git commit -m "refactor: migrate HolyNames table from Chakra to shadcn Table"
```

---

### Task 12: Refactor Profile page

**Covers:** [S7]
**Files:**
- Modify: `src/app/dashboard/profile/page.tsx`

- [ ] **Step 1: Read current Profile page**

Read the component to understand form fields and layout.

- [ ] **Step 2: Rewrite Profile page**

Replace with:
- shadcn `Card`, `CardHeader`, `CardContent`
- shadcn `Input` for text fields
- shadcn `Label` for form labels
- shadcn `Button` for submit/cancel
- shadcn `Avatar` with upload capability
- Tailwind `flex flex-col gap-4` for form layout
- Remove Chakra `FormControl`, `FormLabel`, `Input`, `Avatar`, `AvatarBadge`, `Flex`, `Button`

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/profile/page.tsx
git commit -m "refactor: migrate Profile page from Chakra forms to shadcn/ui"
```

---

## Phase 4: Remaining Pages

### Task 13: Refactor ProductCard

**Covers:** [S7]
**Files:**
- Modify: `src/components/ProductCard/ProductCard.tsx`

- [ ] **Step 1: Read current ProductCard**

Read the component.

- [ ] **Step 2: Rewrite ProductCard**

Replace with:
- shadcn `Card`, `CardHeader`, `CardContent`
- Next.js `<Image>` or `<img>` with Tailwind classes
- Tailwind hover effects (`hover:scale-105 transition-transform`)
- Remove Chakra `Box`, `Center`, `Heading`, `Text`, `Stack`, `Image`

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductCard/
git commit -m "refactor: migrate ProductCard from Chakra to shadcn Card"
```

---

### Task 14: Refactor CookiesPreference

**Covers:** [S7]
**Files:**
- Modify: `src/components/CookiesPreferebce/index.tsx`

- [ ] **Step 1: Read current CookiesPreference**

Read the component.

- [ ] **Step 2: Rewrite CookiesPreference**

Replace with:
- daisyUI `alert` class or Tailwind fixed-position banner
- shadcn `Button` for actions
- `react-icons` `FcLock` kept as-is
- Remove Chakra `Stack`, `Text`, `Button`

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/CookiesPreferebce/
git commit -m "refactor: migrate CookiesPreference from Chakra to Tailwind"
```

---

### Task 15: Refactor Landing Page

**Covers:** [S7]
**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read current landing page**

Read the component to understand hero structure.

- [ ] **Step 2: Rewrite landing page hero**

Replace with:
- Tailwind gradient overlay (`bg-gradient-to-b from-transparent to-black/60`)
- Tailwind flex/centering utilities
- shadcn `Button` for CTAs
- Font-uthman class for Arabic headings
- Remove Chakra `Box`, `Flex`, `Heading`, `Button`, `Container`, gradient props

- [ ] **Step 3: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: migrate landing page hero from Chakra to Tailwind"
```

---

### Task 16: Refactor remaining components

**Covers:** [S7]
**Files:**
- Modify: `src/components/TextUnderLine/index.tsx`
- Modify: `src/components/Illustration/index.tsx`
- Modify: `src/components/AlefpageSection/ExploreTemplates.tsx`
- Modify: `src/components/AlefpageSection/Features.tsx`

- [ ] **Step 1: Read all four components**

Read each component to understand current structure.

- [ ] **Step 2: Rewrite TextUnderLine**

Replace Chakra `Box` with Tailwind:
- Use `relative` + `after:` pseudo-element for underline
- Replace `useColorModeValue` with CSS variables or `dark:` variant

- [ ] **Step 3: Rewrite Illustration**

Replace Chakra `Icon` with inline SVG or lucide-react icon:
- Tailwind classes for sizing and colors

- [ ] **Step 4: Rewrite ExploreTemplates**

Replace with:
- Tailwind `bg-brand-500` (orange) background
- shadcn `Button` for CTA
- Tailwind flex/heading utilities
- Remove Chakra `SimpleGrid`, `Container`, `Button`, `ArrowForwardIcon`

- [ ] **Step 5: Rewrite Features**

Replace with:
- Tailwind `grid grid-cols-1 md:grid-cols-3`
- Tailwind typography and spacing
- Remove Chakra `Container`, `Heading`, `Flex`, `Stack`

- [ ] **Step 6: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/TextUnderLine/ src/components/Illustration/ src/components/AlefpageSection/
git commit -m "refactor: migrate remaining components from Chakra to Tailwind"
```

---

### Task 17: Refactor remaining pages

**Covers:** [S7]
**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/quran/page.tsx`
- Modify: `src/app/dashboard/holy-names/page.tsx`
- Modify: `src/app/dashboard/jadwal/page.tsx`
- Modify: `src/app/learn/page.tsx`
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/register/page.tsx`
- Modify: `src/app/auth/confirm/page.tsx`
- Modify: `src/app/auth/verify-email/page.tsx`
- Modify: `src/app/auth/reset-password/page.tsx`

- [ ] **Step 1: Read all page files**

Read each page to identify Chakra usage.

- [ ] **Step 2: Refactor dashboard/page.tsx**

Remove Chakra `Box` wrappers, use Tailwind `p-4` or `container`.

- [ ] **Step 3: Refactor dashboard/quran/page.tsx**

Remove Chakra `Badge`, use daisyUI `badge` class or shadcn `Badge`.

- [ ] **Step 4: Refactor dashboard/holy-names/page.tsx**

Remove Chakra `Box` wrapper, use Tailwind.

- [ ] **Step 5: Refactor dashboard/jadwal/page.tsx**

Simple placeholder — just ensure no Chakra imports.

- [ ] **Step 6: Refactor learn/page.tsx**

Replace Chakra layout with Tailwind.

- [ ] **Step 7: Refactor auth pages**

Replace Chakra forms with shadcn `Card`, `Input`, `Label`, `Button`.

- [ ] **Step 8: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/ src/app/learn/ src/app/auth/
git commit -m "refactor: migrate all remaining pages from Chakra to Tailwind"
```

---

## Phase 5: Cleanup

### Task 18: Remove Chakra UI

**Covers:** [S3]
**Files:**
- Delete: `src/styles/theme.ts`
- Modify: `src/providers.tsx`
- Modify: `package.json` (via bun remove)

- [ ] **Step 1: Check for any remaining Chakra imports**

```bash
grep -r "@chakra-ui" src/
```

Expected: No results (all migrated)

- [ ] **Step 2: Update providers.tsx — remove ChakraProvider**

Replace `src/providers.tsx`:

```typescript
"use client";

import { ThemeProvider } from "next-themes";
import { Fonts } from "./styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Fonts />
      {children}
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Delete Chakra theme file**

```bash
rm src/styles/theme.ts
```

- [ ] **Step 4: Remove Chakra dependencies**

```bash
bun remove @chakra-ui/react @chakra-ui/icons @chakra-ui/next-js @emotion/cache @emotion/react @emotion/styled framer-motion
```

- [ ] **Step 5: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 6: Run unused check**

```bash
bun run check:unused
```

Expected: PASS

- [ ] **Step 7: Run build**

```bash
bun run build
```

Expected: PASS (no Chakra SSR issues)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: remove Chakra UI and all Emotion dependencies"
```

---

### Task 19: Final verification

**Covers:** [S10]
**Files:** None (verification only)

- [ ] **Step 1: Run lint**

```bash
bun run lint
```

Expected: PASS

- [ ] **Step 2: Run unused check**

```bash
bun run check:unused
```

Expected: PASS

- [ ] **Step 3: Run build**

```bash
bun run build
```

Expected: PASS

- [ ] **Step 4: Verify no Chakra references remain**

```bash
grep -r "chakra" src/ --include="*.tsx" --include="*.ts" -i
```

Expected: No results

- [ ] **Step 5: Verify shadcn components exist**

```bash
ls src/components/ui/
```

Expected: All 13+ component files present

- [ ] **Step 6: Verify globals.css imported**

```bash
grep "globals.css" src/app/layout.tsx
```

Expected: Import statement found

- [ ] **Step 7: Verify dark mode works**

Check that `next-themes` ThemeProvider is in providers.tsx and `darkMode: "class"` is in tailwind.config.ts.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: final verification — all Chakra removed, Tailwind + shadcn operational"
```
