# Auth & Onboarding Design System — Spec

> **For agentic workers:** This spec defines the complete authentication and onboarding experience for seeker-dashboard. It is decomposed into 4 sub-projects executed sequentially.

## [S1] Problem

The current auth pages are generic shadcn/ui cards with hardcoded English text, 3 stubbed pages, broken middleware, and no visual identity. They need to become an initiation experience that communicates wisdom, trust, and transformation while driving signup conversion.

## [S2] Design Principles

- **Luxury Cosmic Minimalism** — premium dark theme with subtle esoteric motifs
- **Arabic-first RTL** — all UI strings in Arabic, right-to-left layout
- **Initiation, not transaction** — auth feels like starting a journey
- **Progressive disclosure** — reveal complexity step-by-step
- **Mobile-first** — responsive from 320px up

## [S3] Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#090B14` | Page background |
| `--surface` | `#111827` | Elevated surfaces |
| `--card` | `#161B2D` | Card backgrounds |
| `--primary` | `#8B5CF6` | Primary actions, accents |
| `--secondary` | `#A78BFA` | Secondary elements |
| `--gold` | `#F5C451` | CTAs, achievements, highlights |
| `--success` | `#22C55E` | Success states |
| `--warning` | `#F59E0B` | Warning states |
| `--danger` | `#EF4444` | Error states |
| `--text` | `#F8FAFC` | Primary text |
| `--text-secondary` | `#CBD5E1` | Secondary text |
| `--border` | `rgba(255,255,255,0.08)` | Subtle borders |

## [S4] Typography

| Role | Font | Source |
|------|------|--------|
| Headings | Cormorant Garamond | Google Fonts |
| Body/UI | Inter | Already loaded |
| Numbers | JetBrains Mono | Google Fonts |

Scale: 14px body, 16px h6 → 48px h1 (tailwind defaults).

## [S5] Spacing System

4px base grid. Tailwind default spacing scale. Key values: 4, 8, 12, 16, 24, 32, 48, 64.

## [S6] Sub-Project 1: Design Tokens + Base Components

**Goal:** Establish the visual foundation — CSS variables, typography, and 5 base components.

**Files to modify:**
- `src/app/globals.css` — add new CSS variable set
- `tailwind.config.ts` — add fonts, extend colors
- `src/components/ui/button.tsx` — add gold variant
- `src/components/ui/input.tsx` — update for dark theme
- `src/components/ui/card.tsx` — update surface colors
- `src/components/ui/badge.tsx` — add gold variant
- `src/styles/fonts.tsx` — add Cormorant Garamond + JetBrains Mono

**Components:**
- Button: primary (violet), gold, ghost, outline, destructive
- Input: dark theme, focus ring with primary color
- Card: surface/card colors, subtle border
- Badge: default, gold, success, danger
- Separator: existing, no changes needed

## [S7] Sub-Project 2: Auth Pages (Login + Register)

**Goal:** Complete login and register pages with split-screen layout, OAuth, and Arabic text.

**Files to create:**
- `src/app/auth/layout.tsx` — split-screen auth layout
- `src/components/auth/OAuthButton.tsx` — Google/Apple/GitHub variants
- `src/components/auth/PasswordField.tsx` — with show/hide toggle
- `src/components/auth/AuthDivider.tsx` — "or" separator

**Files to modify:**
- `src/app/auth/login/page.tsx` — full redesign
- `src/app/auth/register/page.tsx` — full redesign
- `src/texts/index.ts` — add auth section

**Layout (desktop):**
- Left 55%: dark gradient bg, sacred geometry overlay (CSS), Quran verse hero, 5 feature highlights with icons, social proof stats
- Right 45%: centered Card with form
- Mobile: full-width, hero collapses to header

**Login form:** OAuth buttons → divider → email + password → remember me + forgot password → Sign In CTA → Create Account link

**Register form:** OAuth buttons → divider → email + password + confirm password → terms checkbox → Create Account CTA → Sign In link

## [S8] Sub-Project 3: Registration Wizard

**Goal:** 4-step multi-step registration flow with interest/goal selection.

**Files to create:**
- `src/components/auth/Stepper.tsx` — horizontal progress indicator
- `src/components/auth/InterestCard.tsx` — selectable multi-choice card
- `src/components/auth/GoalCard.tsx` — selectable single-choice card
- `src/components/auth/AvatarUpload.tsx` — drag-drop avatar upload

**Files to modify:**
- `src/app/auth/register/page.tsx` — extend to wizard OR create `src/app/auth/register/wizard/page.tsx`
- `src/texts/index.ts` — add wizard text

**Steps:**
1. Account: email, password, confirm password, terms
2. Interests: 9 selectable cards (multi), glow on select
3. Goals: 6 selectable cards (single), radio-style
4. Profile: display name, avatar upload, optional birth fields

**State:** Client-side useState. No backend until "Begin Journey" submit.

## [S9] Sub-Project 4: Remaining Pages + Components

**Goal:** Password recovery, email verification, welcome success, onboarding, mobile auth, remaining components.

**Pages to create:**
- `src/app/auth/request-reset/page.tsx` — redesign (currently stubbed)
- `src/app/auth/verify-email/page.tsx` — redesign (currently stubbed)
- `src/app/auth/welcome/page.tsx` — new success screen
- `src/app/auth/onboarding/page.tsx` — new questionnaire flow

**Components to create:**
- `src/components/auth/Modal.tsx` — dialog wrapper
- `src/components/auth/BottomSheet.tsx` — mobile slide-up
- `src/components/auth/Toast.tsx` — notification (use sonner)
- `src/components/ui/tooltip.tsx` — already exists
- `src/components/auth/LoadingState.tsx`
- `src/components/auth/EmptyState.tsx`
- `src/components/auth/ErrorState.tsx`
- `src/components/auth/SuccessState.tsx`
- `src/components/auth/AchievementCard.tsx`
- `src/components/auth/XPBadge.tsx`
- `src/components/auth/LevelBadge.tsx`
- `src/components/auth/NavigationHeader.tsx`
- `src/components/auth/Footer.tsx`

**Mobile auth:** Single column, sticky CTA at bottom, bottom sheet for auth options, 48px min touch targets.

## [S10] Accessibility

- WCAG AA contrast ratios (all text on dark bg must meet 4.5:1)
- Keyboard navigable (tab order, focus rings)
- Screen reader labels on all interactive elements
- `aria-live` regions for form errors
- Focus trap in modals/bottom sheets

## [S11] File Map

```
src/
├── app/
│   ├── auth/
│   │   ├── layout.tsx              (SP2 - new)
│   │   ├── login/page.tsx          (SP2 - rewrite)
│   │   ├── register/page.tsx       (SP2/SP3 - rewrite/extend)
│   │   ├── register/wizard/        (SP3 - new, optional)
│   │   ├── request-reset/page.tsx  (SP4 - rewrite)
│   │   ├── verify-email/page.tsx   (SP4 - rewrite)
│   │   ├── welcome/page.tsx        (SP4 - new)
│   │   └── onboarding/page.tsx     (SP4 - new)
│   └── globals.css                 (SP1 - modify)
├── components/
│   ├── auth/
│   │   ├── OAuthButton.tsx         (SP2)
│   │   ├── PasswordField.tsx       (SP2)
│   │   ├── AuthDivider.tsx         (SP2)
│   │   ├── Stepper.tsx             (SP3)
│   │   ├── InterestCard.tsx        (SP3)
│   │   ├── GoalCard.tsx            (SP3)
│   │   ├── AvatarUpload.tsx        (SP3)
│   │   ├── Modal.tsx               (SP4)
│   │   ├── BottomSheet.tsx         (SP4)
│   │   ├── LoadingState.tsx        (SP4)
│   │   ├── EmptyState.tsx          (SP4)
│   │   ├── ErrorState.tsx          (SP4)
│   │   ├── SuccessState.tsx        (SP4)
│   │   ├── AchievementCard.tsx     (SP4)
│   │   ├── XPBadge.tsx             (SP4)
│   │   ├── LevelBadge.tsx          (SP4)
│   │   ├── NavigationHeader.tsx    (SP4)
│   │   └── Footer.tsx              (SP4)
│   └── ui/
│       ├── button.tsx              (SP1 - modify)
│       ├── input.tsx               (SP1 - modify)
│       ├── card.tsx                (SP1 - modify)
│       ├── badge.tsx               (SP1 - modify)
│       └── separator.tsx           (no change)
├── texts/index.ts                  (SP2/SP3 - add auth + wizard sections)
├── styles/fonts.tsx                (SP1 - modify)
└── tailwind.config.ts              (SP1 - modify)
```
