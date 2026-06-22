# Learn Page Implementation Plan

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/learn-page.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the `/learn` page with a hero section and feature card grid showcasing all 11 platform features, plus add a navigation link.

**Architecture:** Standalone page (no dashboard sidebar) with Quran verse hero matching landing page style, responsive card grid using shadcn/ui Card + lucide-react icons, and Arabic text via DefaultText. Minimal top nav bar with Home + Dashboard links. Reuse existing appFooter.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, shadcn/ui (Card, Button), lucide-react icons, DefaultText i18n pattern

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/texts/index.ts` | Add `learn` section with all Arabic strings |
| `src/app/learn/page.tsx` | Replace stub with full hero + card grid page |
| `src/app/learn/layout.tsx` | Create — minimal layout with top nav bar |

---

## Task 1: Add Learn Text Strings

**Files:**
- Modify: `src/texts/index.ts`

- [ ] **Step 1: Add `learn` section to DefaultText**

Add after the `PlanetaryHours` section (before the closing `};`):

```typescript
  learn: {
    hero: {
      verse: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ سَيُجْزَوْنَ مَا كَانُوا يَعْمَلُونَ",
      title: "الباحث",
      subtitle: "المنصة الخاصة بالعلوم الروحانية",
    },
    nav: {
      home: "الرئيسية",
      dashboard: "لوحة التحكم",
    },
    features: {
      jummal: {
        title: "حساب الجُمَّل",
        description: "تحويل النصوص العربية إلى قيم عددية باستخدام أنظمة الحساب الأبجدي",
      },
      quran: {
        title: "القرءان الكريم",
        description: "تصفح الآيات مع القيم العددية والإشارة إلى الأسماء الحسنى",
      },
      holyNames: {
        title: "الأسماء الحسنى",
        description: "جدول الأسماء الحسنى التسعين مع خصائصها ومعانيها",
      },
      wafq: {
        title: "الأوفاق",
        description: "توليد المربعات السحرية ثلاثية الأبعاد بالعناصر الأربعة",
      },
      prayer: {
        title: "أوقات الصلاة",
        description: "حساب أوقات الصلوات الخمس حسب الموقع والطريقة الحسابية",
      },
      astro: {
        title: "الأوضاع الفلكية",
        description: "اتجاه القبلة وطور القمر وبيانات الشمس",
      },
      tasbih: {
        title: "التسبيح",
        description: "عدّاد الذكر التفاعلي مع presets جاهزة وإحصائيات يومية",
      },
      bookmarks: {
        title: "العلامات المحفوظة",
        description: "حفظ وتنظيم آيات القرآن المعروفة بألوان وتسميات",
      },
      journal: {
        title: "اليوميات الروحانية",
        description: "تدوين الملاحظات والتجارب الروحية مع تصنيفات وأ mood",
      },
      dua: {
        title: "الأدعية",
        description: "مكتبة الأدعية منظمة حسب الفئات مع النطق والترجمة",
      },
      lodge: {
        title: "بروتوكول اللودج",
        description: "إطار حاسوبي لترميز النية ومحاذاة الوقت وبناء العادات",
      },
    },
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/texts/index.ts
git commit -m "feat: add learn page Arabic text strings"
```

---

## Task 2: Create Learn Page Layout

**Files:**
- Create: `src/app/learn/layout.tsx`

- [ ] **Step 1: Create layout with top nav bar**

```tsx
import Link from "next/link";
import { DefaultText } from "~/texts";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="font-uthman text-lg font-bold text-foreground"
          >
            {DefaultText.learn.nav.home}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {DefaultText.learn.nav.dashboard}
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/learn/layout.tsx
git commit -m "feat: add learn page layout with nav bar"
```

---

## Task 3: Implement Learn Page

**Files:**
- Modify: `src/app/learn/page.tsx`

- [ ] **Step 1: Replace stub with full page**

```tsx
import {
  BookOpen,
  Calculator,
  Compass,
  Gem,
  Grid3X3,
  Heart,
  Moon,
  PenLine,
  Bookmark,
  Sparkles,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { DefaultText } from "~/texts";
import Footer from "~/components/Footer/appFooter";

const features = [
  { icon: Calculator, key: "jummal" as const },
  { icon: BookOpen, key: "quran" as const },
  { icon: Star, key: "holyNames" as const },
  { icon: Grid3X3, key: "wafq" as const },
  { icon: Compass, key: "prayer" as const },
  { icon: Moon, key: "astro" as const },
  { icon: Gem, key: "tasbih" as const },
  { icon: Bookmark, key: "bookmarks" as const },
  { icon: PenLine, key: "journal" as const },
  { icon: Heart, key: "dua" as const },
  { icon: Sparkles, key: "lodge" as const },
] as const;

export default function LearnMorePage() {
  const { hero, features: featureTexts } = DefaultText.learn;

  return (
    <>
      {/* Hero */}
      <section className="flex w-full bg-[url('/cube.jpg')] bg-cover bg-center bg-fixed">
        <div className="flex w-full items-center justify-center bg-gradient-to-b from-black/60 to-purple-600 px-4 md:px-8">
          <div className="mx-auto max-w-6xl py-20 text-center md:py-28">
            <h1 className="font-uthman drop-shadow-lg shadow-purple-600 text-2xl leading-[150%] text-white sm:text-4xl md:text-6xl">
              {hero.verse}
            </h1>
            <p className="mt-6 text-lg text-white/80">{hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <h2 className="font-uthman mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
          الميزات
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key }) => (
            <Card key={key} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">
                  {featureTexts[key].title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {featureTexts[key].description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Run lint**

Run: `bun run lint 2>&1 | tail -5`
Expected: 0 errors (pre-existing warnings OK)

- [ ] **Step 3: Run build**

Run: `bun run build 2>&1 | tail -10`
Expected: Build succeeds, `/learn` page generated

- [ ] **Step 4: Commit**

```bash
git add src/app/learn/page.tsx
git commit -m "feat: implement learn page with hero and feature grid"
```

---

## Task 4: Add Navigation Link

**Files:**
- Modify: `src/config/site.ts`

- [ ] **Step 1: Add learn route to navItems**

In `src/config/site.ts`, add a learn entry to the `navItems` array:

```typescript
navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Learn",
      href: "/learn",
    },
    {
      label: "dashboard",
      href: "/dashboard",
    },
    // ... rest unchanged
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/config/site.ts
git commit -m "feat: add learn page to site navigation"
```

---

## Task 5: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

Run: `bun run lint 2>&1 | tail -5`
Expected: 0 errors

- [ ] **Step 2: Run build**

Run: `bun run build 2>&1 | tail -10`
Expected: Build succeeds, all pages generated including `/learn`

- [ ] **Step 3: Run unused check**

Run: `bun run check:unused 2>&1 | tail -5`
Expected: May still flag pre-existing unused files (not caused by this change)
