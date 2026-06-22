"use client";

import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Progress } from "~/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import {
  Palette,
  Type,
  Ruler,
  Layers,
  Sparkles,
  Star,
  Moon,
  Sun,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Search,
  Bell,
  Shield,
  Heart,
  Bookmark,
  Compass,
  Zap,
  Globe,
  Infinity,
  Crown,
} from "lucide-react";

/* ───────────────────────────────────────────
   Color swatch config
   ─────────────────────────────────────────── */
interface ColorToken {
  label: string;
  labelAr: string;
  varName: string;
  className: string;
  group: "semantic" | "gold" | "cosmic";
}

const semanticTokens: ColorToken[] = [
  { label: "Background", labelAr: "الخلفية", varName: "--background", className: "bg-background", group: "semantic" },
  { label: "Foreground", labelAr: "المقدمة", varName: "--foreground", className: "bg-foreground", group: "semantic" },
  { label: "Card", labelAr: "البطاقة", varName: "--card", className: "bg-card", group: "semantic" },
  { label: "Card Foreground", labelAr: "نص البطاقة", varName: "--card-foreground", className: "bg-card-foreground", group: "semantic" },
  { label: "Primary", labelAr: "أساسي", varName: "--primary", className: "bg-primary", group: "semantic" },
  { label: "Secondary", labelAr: "ثانوي", varName: "--secondary", className: "bg-secondary", group: "semantic" },
  { label: "Muted", labelAr: "خافت", varName: "--muted", className: "bg-muted", group: "semantic" },
  { label: "Muted Foreground", labelAr: "نص خافت", varName: "--muted-foreground", className: "bg-muted-foreground", group: "semantic" },
  { label: "Accent", labelAr: "تمييز", varName: "--accent", className: "bg-accent", group: "semantic" },
  { label: "Destructive", labelAr: "تدمير", varName: "--destructive", className: "bg-destructive", group: "semantic" },
  { label: "Border", labelAr: "حدود", varName: "--border", className: "bg-border", group: "semantic" },
  { label: "Input", labelAr: "إدخال", varName: "--input", className: "bg-input", group: "semantic" },
  { label: "Ring", labelAr: "حلقة", varName: "--ring", className: "bg-ring", group: "semantic" },
  { label: "Success", labelAr: "نجاح", varName: "--success", className: "bg-emerald-500", group: "semantic" },
  { label: "Warning", labelAr: "تحذير", varName: "--warning", className: "bg-amber-500", group: "semantic" },
];

const goldShades = [
  { shade: 50, hex: "#fdf8e8" },
  { shade: 100, hex: "#fcf0c8" },
  { shade: 200, hex: "#f9e4a0" },
  { shade: 300, hex: "#f5d46e" },
  { shade: 400, hex: "#f5c451" },
  { shade: 500, hex: "#eeb234" },
  { shade: 600, hex: "#d4941f" },
  { shade: 700, hex: "#b07716" },
  { shade: 800, hex: "#8e5e17" },
  { shade: 900, hex: "#754d19" },
  { shade: 950, hex: "#3d2605" },
];

const cosmicShades = [
  { shade: 50, hex: "#f0f1ff" },
  { shade: 100, hex: "#e0e2ff" },
  { shade: 200, hex: "#c7cafe" },
  { shade: 300, hex: "#a5a8fc" },
  { shade: 400, hex: "#8b5cf6" },
  { shade: 500, hex: "#7c3aed" },
  { shade: 600, hex: "#6d28d9" },
  { shade: 700, hex: "#5b21b6" },
  { shade: 800, hex: "#4c1d95" },
  { shade: 900, hex: "#3b0f7a" },
  { shade: 950, hex: "#1e0a3d" },
];

/* ───────────────────────────────────────────
   Spacing scale data
   ─────────────────────────────────────────── */
const spacingScale = [
  { name: "1", px: 4, var: "--spacing-1" },
  { name: "2", px: 8, var: "--spacing-2" },
  { name: "3", px: 12, var: "--spacing-3" },
  { name: "4", px: 16, var: "--spacing-4" },
  { name: "5", px: 20, var: "--spacing-5" },
  { name: "6", px: 24, var: "--spacing-6" },
  { name: "8", px: 32, var: "--spacing-8" },
  { name: "10", px: 40, var: "--spacing-10" },
  { name: "12", px: 48, var: "--spacing-12" },
  { name: "16", px: 64, var: "--spacing-16" },
  { name: "20", px: 80, var: "--spacing-20" },
  { name: "24", px: 96, var: "--spacing-24" },
];

/* ───────────────────────────────────────────
   Typography samples
   ─────────────────────────────────────────── */
const typeSamples = [
  { tag: "h1", size: "text-4xl md:text-5xl", weight: "font-bold", desc: "Display / عنوان كبير", sample: "بسم الله الرحمن الرحيم" },
  { tag: "h2", size: "text-3xl", weight: "font-semibold", desc: "Heading 1 / عنوان رئيسي", sample: "الحمد لله رب العالمين" },
  { tag: "h3", size: "text-2xl", weight: "font-semibold", desc: "Heading 2 / عنوان فرعي", sample: "اللهم صل على محمد" },
  { tag: "h4", size: "text-xl", weight: "font-medium", desc: "Heading 3 / عنوان قسم", sample: "سبحان الله وبحمده" },
  { tag: "body", size: "text-base", weight: "font-normal", desc: "Body / نص عادي", sample: "نظام الباحث لخدمات الأذكار والأدعية والأسماء الحسنى" },
  { tag: "small", size: "text-sm", weight: "font-normal", desc: "Small / نص صغير", sample: "تواريخ وأوقات الصلوات الخمس حسب موقعك" },
  { tag: "xs", size: "text-xs", weight: "font-normal", desc: "Extra Small / متناهي الصغر", sample: "آخر تحديث: منذ 5 دقائق" },
  { tag: "muted", size: "text-sm", weight: "font-normal", desc: "Muted / نص مكتوم", sample: "هذا النص بدرجة تباين أقل للعناصر الثانوية", muted: true },
];

/* ───────────────────────────────────────────
   Animation features
   ─────────────────────────────────────────── */
const animations = [
  { name: "fade-in", nameAr: "ظهور متدرج", class: "animate-fade-in", icon: Sparkles, desc: "Fades in with upward slide" },
  { name: "pulse-glow", nameAr: "توهج نابض", class: "animate-pulse-glow", icon: Zap, desc: "Pulsing cosmic glow shadow" },
  { name: "float", nameAr: "طفو", class: "animate-float", icon: Moon, desc: "Gentle floating motion" },
  { name: "spin-slow", nameAr: "دوران بطيء", class: "animate-spin-slow", icon: Compass, desc: "Slow continuous rotation" },
  { name: "shimmer", nameAr: "لمعان", class: "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent", icon: Star, desc: "Shimmering sweep effect" },
];

/* ───────────────────────────────────────────
   Section heading component
   ─────────────────────────────────────────── */
function SectionHeading({ icon: Icon, title, titleAr, description }: {
  icon: React.ElementType;
  title: string;
  titleAr: string;
  description?: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 ring-1 ring-gold-500/20">
        <Icon className="h-5 w-5 text-gold-400" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gold-400">{titleAr}</h2>
        <p className="text-sm text-muted-foreground">{title} {description && `— ${description}`}</p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Color swatch component
   ─────────────────────────────────────────── */
function ColorSwatch({ bgClass, label, labelAr, varName }: {
  bgClass: string;
  label: string;
  labelAr: string;
  varName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-gold-500/30">
      <div className={cn("h-10 w-10 shrink-0 rounded-md ring-1 ring-inset ring-white/10", bgClass)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{labelAr}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <code className="mt-0.5 block truncate text-[10px] text-gold-400/70">{varName}</code>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Shade swatch — for gold / cosmic
   ─────────────────────────────────────────── */
function ShadeSwatch({ hex, shade }: { hex: string; shade: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-12 w-full rounded-md ring-1 ring-inset ring-white/10"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-medium text-foreground">{shade}</span>
      <code className="text-[10px] text-muted-foreground">{hex}</code>
    </div>
  );
}

/* ───────────────────────────────────────────
   Main page
   ─────────────────────────────────────────── */
export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background pb-24">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Ambient bg glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-950/40 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 bg-gradient-radial from-gold-500/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <Badge variant="outline" className="mb-6 border-gold-500/30 bg-gold-500/5 text-gold-400">
              <Layers className="ml-1.5 h-3.5 w-3.5" />
              v1.0 — Al-Baheth
            </Badge>

            <h1 className="bg-gradient-to-b from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
              نظام التصميم
            </h1>
            <p className="mt-3 text-xl text-muted-foreground md:text-2xl">
              Design System
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground/70">
              المرجع البصري لمنصة الباحث — دليل الأنماط والمكونات والألوان والطباعة
              <br />
              Visual style guide &ndash; colors, typography, components, and tokens
            </p>

            {/* Quick nav pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {[
                { href: "#colors", label: "الألوان", labelEn: "Colors", icon: Palette },
                { href: "#typography", label: "الطباعة", labelEn: "Typography", icon: Type },
                { href: "#spacing", label: "المسافات", labelEn: "Spacing", icon: Ruler },
                { href: "#components", label: "المكونات", labelEn: "Components", icon: Layers },
                { href: "#animations", label: "الحركة", labelEn: "Animations", icon: Sparkles },
                { href: "#auth-example", label: "نموذج تسجيل", labelEn: "Auth Card", icon: Shield },
              ].map((item) => (
                <a key={item.href} href={item.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 text-xs hover:border-gold-500/30 hover:text-gold-400"
                  >
                    <item.icon className="ml-1 h-3.5 w-3.5" />
                    {item.label}
                    <span className="mr-1 text-[10px] text-muted-foreground">{item.labelEn}</span>
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 pt-16">
        {/* ════════════════════════════════════════
            COLORS
           ════════════════════════════════════════ */}
        <section id="colors">
          <SectionHeading icon={Palette} title="Colors" titleAr="الألوان" description="CSS variables + custom palette" />

          {/* Semantic tokens */}
          <Card className="mb-8 overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Layers className="h-4 w-4" />
                Semantic Tokens / الرموز الدلالية
              </CardTitle>
              <CardDescription>CSS custom properties used throughout the application</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {semanticTokens.map((t) => (
                  <ColorSwatch key={t.varName} bgClass={t.className} label={t.label} labelAr={t.labelAr} varName={t.varName} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gold palette */}
          <Card className="mb-8 overflow-hidden border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10 bg-gold-500/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Crown className="h-4 w-4" />
                Gold Palette / الذهبي
                <span className="text-xs text-muted-foreground">gold-50 → gold-950</span>
              </CardTitle>
              <CardDescription>Primary accent color for highlights, headings, and CTAs</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {goldShades.map((s) => (
                  <ShadeSwatch key={s.shade} {...s} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cosmic palette */}
          <Card className="overflow-hidden border-cosmic-500/20">
            <CardHeader className="border-b border-cosmic-500/10 bg-cosmic-500/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cosmic-400">
                <Moon className="h-4 w-4" />
                Cosmic Palette / الكوني
                <span className="text-xs text-muted-foreground">cosmic-50 → cosmic-950</span>
              </CardTitle>
              <CardDescription>Secondary accent for mystical, spiritual elements</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {cosmicShades.map((s) => (
                  <ShadeSwatch key={s.shade} {...s} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ════════════════════════════════════════
            TYPOGRAPHY
           ════════════════════════════════════════ */}
        <section id="typography">
          <SectionHeading icon={Type} title="Typography" titleAr="الطباعة" description="Inter font — all weights and sizes" />

          <Card className="overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-500/10">
                  <span className="font-uthman text-xs text-gold-400">ب</span>
                </div>
                <div>
                  <CardTitle className="text-base text-gold-400">Inter &amp; Uthmanic</CardTitle>
                  <CardDescription>
                    Primary: <code className="text-gold-400/70">Inter</code> — Body &amp; UI · Secondary: <code className="text-gold-400/70">Uthman</code> — Quranic
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/30 p-0">
              {typeSamples.map((t) => (
                <div key={t.tag} className="flex flex-col gap-1 px-6 py-4 first:pt-6 last:pb-6">
                  <div className="flex items-baseline justify-between">
                    <span className={cn(t.size, t.weight, t.muted && "text-muted-foreground")}>
                      {t.sample}
                    </span>
                    <Badge variant="outline" className="mr-4 shrink-0 text-[10px] text-muted-foreground">
                      {t.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/60">{t.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ════════════════════════════════════════
            SPACING SCALE
           ════════════════════════════════════════ */}
        <section id="spacing">
          <SectionHeading icon={Ruler} title="Spacing Scale" titleAr="سلم المسافات" description="4px / 8px increment system" />

          <Card className="overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Ruler className="h-4 w-4" />
                Spacing tokens / رموز التباعد
              </CardTitle>
              <CardDescription>Tailwind spacing scale mapped to px values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {spacingScale.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="w-16 shrink-0 text-right">
                    <code className="text-sm text-gold-400">p-{s.name}</code>
                    <p className="text-[10px] text-muted-foreground">{s.px}px</p>
                  </div>
                  <div
                    className="h-6 rounded bg-gold-500/40 ring-1 ring-gold-500/20 transition-all hover:bg-gold-500/60"
                    style={{ width: `${s.px}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{s.var}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ════════════════════════════════════════
            COMPONENTS
           ════════════════════════════════════════ */}
        <section id="components">
          <SectionHeading icon={Layers} title="Components" titleAr="المكونات" description="shadcn/ui primitives" />

          {/* ── Buttons ── */}
          <Card className="mb-6 overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Zap className="h-4 w-4" />
                Button Variants / أنواع الأزرار
              </CardTitle>
              <CardDescription>All built-in variants with custom gold accent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Row 1: standard variants */}
              <div className="flex flex-wrap items-center gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              {/* Row 2: sizes */}
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Icon button"><Search className="h-4 w-4" /></Button>
              </div>
              {/* Row 3: gold accent — custom via className */}
              <Separator />
              <p className="text-xs font-medium text-muted-foreground">Custom gold accent / تذهيب مخصص</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="bg-gold-500 text-gold-950 hover:bg-gold-400">
                  <Crown className="h-4 w-4" />
                  Gold
                </Button>
                <Button className="border-gold-500/40 bg-transparent text-gold-400 hover:bg-gold-500/10">
                  Gold Outline
                </Button>
                <Button className="bg-gradient-to-r from-gold-600 to-gold-400 text-gold-950 hover:from-gold-500 hover:to-gold-300">
                  Gold Gradient
                </Button>
                <Button className="bg-cosmic-500 text-white hover:bg-cosmic-400">
                  <Moon className="h-4 w-4" />
                  Cosmic
                </Button>
              </div>
              {/* Row 4: disabled */}
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>Disabled</Button>
                <Button variant="destructive" disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Card showcase ── */}
          <Card className="mb-6 overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Layers className="h-4 w-4" />
                Card Anatomy / تشريح البطاقة
              </CardTitle>
              <CardDescription>Card with Header, Title, Description, Content, Footer</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              {/* Card example A — minimal */}
              <Card>
                <CardHeader>
                  <CardTitle>بطاقة بسيطة</CardTitle>
                  <CardDescription>Simple card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    هذا هو محتوى البطاقة. يمكن استخدامه لعرض المعلومات المتنوعة في واجهة المستخدم.
                  </p>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button variant="outline" size="sm">إلغاء</Button>
                  <Button size="sm">حفظ</Button>
                </CardFooter>
              </Card>

              {/* Card example B — detailed with metadata */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>بطاقة مفصلة</CardTitle>
                      <CardDescription>Detailed card with metadata and actions</CardDescription>
                    </div>
                    <Badge className="bg-gold-500/10 text-gold-400 hover:bg-gold-500/20">نشط</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Bookmark className="h-4 w-4 text-cosmic-400" />
                    <span className="text-muted-foreground">القسم:</span>
                    <span>الأذكار</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-cosmic-400" />
                    <span className="text-muted-foreground">المفضلة:</span>
                    <span>١٢٣</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">اكتمال المحتوى: ٦٥٪</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="ghost" size="sm">مشاركة</Button>
                  <Button size="sm">فتح</Button>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>

          {/* ── Form elements + Badges + Tabs ── */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Form elements */}
            <Card className="overflow-hidden border-border/50">
              <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                  <Mail className="h-4 w-4" />
                  Form Elements / عناصر النموذج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Input with label */}
                <div className="space-y-2">
                  <Label htmlFor="ds-email">البريد الإلكتروني</Label>
                  <Input id="ds-email" type="email" placeholder="user@example.com" dir="ltr" />
                  <p className="text-xs text-muted-foreground">Email input with label</p>
                </div>

                {/* Input with icon (inline) */}
                <div className="space-y-2">
                  <Label htmlFor="ds-password">كلمة المرور</Label>
                  <div className="relative">
                    <Input id="ds-password" type="password" placeholder="••••••••" className="pl-9" dir="ltr" />
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox id="ds-terms" />
                  <Label htmlFor="ds-terms" className="text-sm text-muted-foreground">
                    أوافق على الشروط والأحكام
                  </Label>
                </div>

                {/* Select disabled example */}
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-gold-500 text-gold-950 hover:bg-gold-400">تسجيل الدخول</Button>
                  <Button variant="outline">إنشاء حساب</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges + Avatar */}
            <Card className="overflow-hidden border-border/50">
              <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                  <Bell className="h-4 w-4" />
                  Badges &amp; Avatar / الشارات والصورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                {/* Badge variants */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Badge Variants</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-gold-500/10 text-gold-400 hover:bg-gold-500/20">Gold</Badge>
                    <Badge className="bg-cosmic-500/10 text-cosmic-400 hover:bg-cosmic-500/20">Cosmic</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Success</Badge>
                  </div>
                </div>

                <Separator />

                {/* Avatar */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Avatar / الصورة الشخصية</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=seeker" alt="User avatar" />
                      <AvatarFallback>ب</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gold-500/10 text-gold-400">باح</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-cosmic-500/10 text-cosmic-400">الب</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <Separator />

                {/* Skeleton + Progress */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Skeleton / الهيكل العظمي</p>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Progress / شريط التقدم</p>
                  <div className="space-y-2">
                    <Progress value={25} className="h-2" />
                    <Progress value={50} className="h-2" />
                    <Progress value={75} className="h-2" />
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Tabs + Separator ── */}
          <Card className="overflow-hidden border-border/50">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gold-400">
                <Search className="h-4 w-4" />
                Tabs &amp; Separator / الألسنة والفواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="tab1" className="flex-1">الأذكار</TabsTrigger>
                  <TabsTrigger value="tab2" className="flex-1">الأدعية</TabsTrigger>
                  <TabsTrigger value="tab3" className="flex-1">الأسماء</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">محتوى الأذكار — سبحان الله والحمد لله ولا إله إلا الله والله أكبر</p>
                  <Separator />
                  <p className="text-xs text-muted-foreground/60">Horizontal separator shown above (Horizontal / فاصل أفقي)</p>
                </TabsContent>
                <TabsContent value="tab2" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">محتوى الأدعية — ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة</p>
                  <Separator />
                  <div className="flex h-20 items-center gap-4">
                    <p className="text-xs text-muted-foreground/60">Vertical separator (فاصل عمودي):</p>
                    <Separator orientation="vertical" />
                    <p className="text-xs text-muted-foreground/60">Content on the other side</p>
                  </div>
                </TabsContent>
                <TabsContent value="tab3" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">محتوى الأسماء — الله الرحمن الرحيم الملك القدوس السلام</p>
                  <Separator />
                  <p className="text-xs text-muted-foreground/60">The 99 Names of Allah</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* ════════════════════════════════════════
            ANIMATIONS
           ════════════════════════════════════════ */}
        <section id="animations">
          <SectionHeading icon={Sparkles} title="Animations" titleAr="الرسوم المتحركة" description="Tailwind keyframe animations" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {animations.map((anim) => (
              <Card key={anim.name} className="overflow-hidden border-border/50 transition-colors hover:border-gold-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm text-gold-400">
                      <anim.icon className="h-4 w-4" />
                      {anim.nameAr}
                    </CardTitle>
                    <code className="text-[10px] text-muted-foreground">{anim.name}</code>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "flex h-24 items-center justify-center rounded-lg border border-border/50 bg-muted/20",
                      anim.class,
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 ring-1 ring-gold-500/20">
                      <anim.icon className="h-6 w-6 text-gold-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{anim.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            EXAMPLE AUTH CARD
           ════════════════════════════════════════ */}
        <section id="auth-example">
          <SectionHeading icon={Shield} title="Auth Card Example" titleAr="نموذج بطاقة تسجيل الدخول" description="Combined design tokens in context" />

          <Card className="relative overflow-hidden border-border/50">
            {/* Decorative gradient overlay */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cosmic-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-md py-10">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="items-center text-center">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10 ring-1 ring-gold-500/20">
                    <Moon className="h-7 w-7 text-gold-400" />
                  </div>
                  <CardTitle className="text-xl text-gold-400">مرحباً بك في الباحث</CardTitle>
                  <CardDescription>سجل دخولك لمتابعة رحلتك الروحانية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="auth-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Input id="auth-email" type="email" placeholder="your@email.com" className="pl-9" dir="ltr" />
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auth-password">كلمة المرور</Label>
                      <button
                        type="button"
                        className="text-xs text-gold-400 hover:text-gold-300"
                        onClick={() => {}}
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative">
                      <Input id="auth-password" type="password" placeholder="••••••••" className="pl-9" dir="ltr" />
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <Checkbox id="auth-remember" />
                    <Label htmlFor="auth-remember" className="text-sm text-muted-foreground">تذكرني</Label>
                  </div>

                  {/* Submit */}
                  <Button className="w-full bg-gold-500 text-gold-950 hover:bg-gold-400">
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    تسجيل الدخول
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] text-muted-foreground">
                      أو
                    </span>
                  </div>

                  {/* Register */}
                  <Button variant="outline" className="w-full border-cosmic-500/30 text-cosmic-400 hover:bg-cosmic-500/10">
                    إنشاء حساب جديد
                  </Button>
                </CardContent>
                <CardFooter className="justify-center pt-0">
                  <p className="text-center text-xs text-muted-foreground/60">
                    بالتسجيل أنت توافق على{" "}
                    <button type="button" className="text-gold-400 hover:text-gold-300" onClick={() => {}}>
                      الشروط والأحكام
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </Card>
        </section>

        {/* ════════════════════════════════════════
            FOOTER
           ════════════════════════════════════════ */}
        <footer className="border-t border-border/30 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Infinity className="h-4 w-4 text-gold-400" />
            <span>Al-Baheth Design System v1.0</span>
            <span className="mx-2 text-muted-foreground/30">·</span>
            <span className="text-xs">آخر تحديث — 2026</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/40">
            Built with Next.js · Tailwind CSS · shadcn/ui · Radix UI
          </p>
        </footer>
      </div>
    </main>
  );
}
