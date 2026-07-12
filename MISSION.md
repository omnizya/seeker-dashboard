# Mission: World-Class Auth & Onboarding Design for Esoteric Knowledge SaaS

## Why
Design and implement a top-1% authentication and onboarding experience for **الباحث (seeker)** — an Arabic-first spiritual development platform. The current auth pages are generic shadcn/ui cards with placeholder text. They need to become an initiation experience that communicates wisdom, trust, and transformation while driving signup conversion and user activation.

## Success looks like
- A complete design system token set (colors, typography, spacing, symbols) grounded in the esoteric/heavenly theme
- Fully redesigned Login and Register pages implementing the multi-step onboarding flow
- A gamification layer (XP, levels, achievements, seeker identity) activated immediately after registration
- The design achieves "Top 1% SaaS onboarding" quality — competitive with Notion, Duolingo, Headspace, Linear, Stripe
- Auth experience is Arabic-first (RTL) — not a translation, but designed from the ground up for Arabic readers
- WCAG AA minimum accessibility throughout
- Mobile-first responsive layout

## Constraints
- Stack: Next.js 16 + Tailwind CSS v3 + shadcn/ui + Radix UI (already established in project)
- Arabic-first RTL: all UI strings in Arabic, right-to-left layout, culturally appropriate symbology
- Must work within existing project structure (src/app/auth/, existing server actions)
- Must maintain compatibility with existing Supabase auth (login/signup server actions)
- Dark mode by default (project uses next-themes with class strategy)
- No additional CSS framework or component library — use existing shadcn/ui primitives

## Out of scope
- Backend auth logic changes (server actions, Supabase config, email templates)
- Payment/subscription auth (no paywalls or billing in this scope)
- Admin panel auth
- Third-party OAuth provider setup (Google/Apple/GitHub — design the UI, not the integration)
- Passwordless magic link backend implementation
