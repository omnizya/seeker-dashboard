# UI Refactoring Design Spec: Tailwind + shadcn/ui + daisyUI

## [S1] Problem

The project uses Chakra UI v2 as its primary styling system, but:
- Chakra + Emotion adds significant bundle weight
- Tailwind CSS is half-installed (PostCSS configured, some `className` usage, but no `tailwind.config` or global CSS)
- No dark mode support despite `next-themes` being installed
- 13 component files with ad-hoc patterns, no consistent design token system
- No shadcn/ui or daisyUI configured

**Goal**: Comprehensive modernization — better UI polish, reduced bundle size, improved developer experience.

## [S2] Approach

**Incremental migration** — set up Tailwind/shadcn/daisyUI alongside Chakra, migrate component by component, remove Chakra last.

**Stack split**:
- **shadcn/ui**: Primary design system for all interactive components (Button, Card, Input, Table, Dialog, etc.)
- **daisyUI**: Only for simple display classes (badge, stat, alert) where shadcn doesn't have equivalents
- **Raw Tailwind**: Layout utilities (flex, grid, spacing, typography)

**RTL**: Must work perfectly — Tailwind v3 `rtl:` variant prefix + shadcn logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).

**Dark mode**: `next-themes` with `attribute="class"` strategy, CSS variables swap via `.dark` class.

## [S3] Dependencies

### Install:
- `tailwindcss` + `@tailwindcss/postcss` (classic v3 for stability)
- `@shadcn/ui` via `bunx shadcn@latest init`
- `daisyui` (Tailwind plugin)
- `class-variance-authority` (shadcn variant system)
- `tailwind-merge` (shadcn `cn()` utility)
- `@radix-ui/*` primitives (shadcn underlying components)
- `next-themes` (already installed, wire it up)
- `lucide-react` (shadcn standard icons)

### Remove after migration:
- `@chakra-ui/react`, `@chakra-ui/icons`, `@chakra-ui/next-js`
- `@emotion/cache`, `@emotion/react`, `@emotion/styled`
- `framer-motion` (only needed by Chakra)
- `src/styles/theme.ts`
- `src/providers.tsx` ChakraProvider wrapper

## [S4] File Structure

```
src/
  styles/
    globals.css          ← NEW: @tailwind directives + CSS variables + shadcn theme
    fonts.tsx            ← KEEP: Uthman font loading
  components/
    ui/                  ← NEW: shadcn generated components
    layout/              ← NEW: Sidebar, Navbar, Footer (refactored)
    dashboard/           ← NEW: JummalCard, HolyNames, etc. (refactored)
    landing/             ← NEW: Hero, Features sections (refactored)
  lib/
    utils.ts             ← NEW: cn() utility (shadcn standard)
```

## [S5] Theme & Tokens

### CSS Variables (in `globals.css`):
```
--background: white (light) / dark-slate (dark)
--foreground: near-black (light) / white (dark)
--primary: orange-500 (brand accent)
--primary-foreground: white
--muted: slate-100 (light) / slate-800 (dark)
--muted-foreground: slate-500 (light) / slate-400 (dark)
--border: slate-200 (light) / slate-700 (dark)
--ring: orange-500 (focus rings)
--radius: 0.5rem
```

### Fonts:
- **Heading/Display**: Uthman (Arabic Quranic typeface) → `--font-uthman`
- **Body**: System font stack → `--font-sans`

### Color preservation mapping:
| Current (Chakra) | New (Tailwind/CSS) |
|---|---|
| `orange.500` / `orange.600` | `--primary` / `--primary-hover` |
| `gray.50` background | `--background` |
| `gray.800` text | `--foreground` |
| `gray.100` muted bg | `--muted` |
| `purple.600` shadows | `--ring` or custom `--accent` |
| `blackAlpha.600` overlays | Tailwind `bg-black/60` |

## [S6] Component Migration Map

| Chakra Component | Replacement | Files |
|---|---|---|
| `Button`, `IconButton` | shadcn `Button` (variants: default, outline, ghost) | 8 |
| `Box`, `Flex`, `Stack`, `HStack`, `VStack` | `div` + Tailwind flex/grid | 11+ |
| `Text`, `Heading` | `p`, `h1-h6` + Tailwind typography | 9 |
| `Input` | shadcn `Input` | 6 |
| `FormControl/FormLabel` | shadcn `Label` + native form elements | 5 |
| `Table` | shadcn `Table` or native `<table>` + Tailwind | 2 |
| `Card/CardBody/CardHeader` | shadcn `Card` | 1 |
| `Badge/Tag` | daisyUI `badge` class | 2 |
| `Stat/StatNumber` | daisyUI `stat` or Tailwind | 1 |
| `Avatar/AvatarBadge` | shadcn `Avatar` | 2 |
| `Drawer` | shadcn `Sheet` (side variant) | 1 |
| `Menu` | shadcn `DropdownMenu` | 1 |
| `SimpleGrid` | Tailwind `grid grid-cols-N` | 2 |
| `Container` | Tailwind `container mx-auto px-4` | 3 |
| `useDisclosure` | React state | 2 |
| `useColorModeValue` | CSS variables / `dark:` variant | 11 |
| `useBreakpointValue` | Tailwind responsive prefixes | 2 |
| `VisuallyHidden` | Tailwind `sr-only` | 1 |
| Chakra icons | `lucide-react` | 1 |
| `react-icons` | Keep as-is (framework-agnostic) | — |

## [S7] Migration Phases

### Phase 1: Foundation (no visual changes)
1. Install Tailwind CSS — create `globals.css` with `@tailwind` directives
2. Create `tailwind.config.ts` with Uthman font, brand colors, dark mode
3. Initialize shadcn/ui: `bunx shadcn@latest init`
4. Install daisyUI plugin
5. Create `src/lib/utils.ts` with `cn()` utility
6. Set up `next-themes` ThemeProvider in `providers.tsx`
7. Add CSS variables to `globals.css` for light/dark themes

### Phase 2: Layout shell (biggest visual impact)
8. Refactor `Navbar.tsx` → shadcn `NavigationMenu` + `Avatar` + `DropdownMenu`
9. Refactor sidebar → shadcn `Sheet` + Tailwind flex layout
10. Refactor Footers → Tailwind grid + shadcn `Input` + `Button`
11. Update layout files

### Phase 3: Core dashboard components
12. Refactor `JummalCard` → shadcn `Card` + `Textarea` + `Table`
13. Refactor `HolyNames` → shadcn `Table` + daisyUI `badge`
14. Refactor Profile page → shadcn `Card` + `Input` + `Button` + `Avatar`

### Phase 4: Remaining pages
15. Refactor `ProductCard` → shadcn `Card` + Tailwind hover
16. Refactor `CookiesPreferebce` → shadcn `Dialog` or daisyUI `alert`
17. Refactor landing page hero → Tailwind gradient + shadcn `Button`
18. Refactor `TextUnderLine`, `Illustration`, `ExploreTemplates`, `Features`

### Phase 5: Cleanup
19. Remove all Chakra imports and dependencies
20. Delete `src/styles/theme.ts`
21. Update `providers.tsx`
22. Run `bun run lint` and `bun run check:unused`
23. Visual QA all pages in both light/dark mode

## [S8] shadcn Pre-built Blocks

```bash
bunx shadcn@latest add button card input label table avatar dropdown-menu sheet badge textarea separator skeleton tooltip
```

### Blocks to use:
| Block | Use For | Replaces |
|---|---|---|
| `hero-01` or `hero-02` | Landing page hero | Current gradient hero |
| `feature-01` or `feature-03` | Features section | `AlefpageSection/Features.tsx` |
| `footer-02` or `footer-03` | App footer | `Footer/index.tsx` |
| `login-01` | Auth pages | Current auth pages |
| `sidebar-01` or `sidebar-02` | Dashboard sidebar | `AlefpageSection/SideBar/page.tsx` |
| `dashboard-01` | Dashboard card layout | `JummalCard`, profile |
| `navbar-01` | Top navigation | `Navbar.tsx` |
| `bento-grid` | Grid layout | `SimpleGrid` usage |
| `stats-01` | Stats display | `Stat/StatNumber` |
| `table-01` or `table-02` | Data tables | HolyNames, Jummal tables |
| `form-01` or `form-02` | Profile/auth forms | `FormControl/FormLabel` |
| `cookie-consent-01` | Cookie banner | `CookiesPreferebce` |
| `cta-01` or `cta-02` | CTA sections | `ExploreTemplates.tsx` |

## [S9] RTL Strategy

- Tailwind v3 first-class RTL via `rtl:` variant prefix
- shadcn uses logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- `dir="rtl"` on `<html>`, Tailwind handles direction automatically
- daisyUI classes are direction-agnostic
- Audit all `left`/`right` positioning to use `start`/`end` logical properties

## [S10] Success Criteria

- All 13 components and all pages migrated to Tailwind + shadcn/daisyUI
- Zero Chakra UI dependencies remaining
- Dark mode works across all pages
- RTL layout renders correctly in all components
- `bun run lint` passes clean
- `bun run check:unused` passes clean
- Bundle size reduced (no Chakra/Emotion in output)
