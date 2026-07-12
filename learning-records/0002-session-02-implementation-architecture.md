# Session 2 — Implementation Architecture: Tokens → Pages

## What was learned

Bridged the gap between design philosophy (Session 1) and actual code. The critical connection point is **shadcn/ui's HSL CSS variable system** — every color from the spec must be converted from HEX to HSL before it can work with the Tailwind/shadcn/ui theming system.

## Key insights

1. **shadcn/ui uses HSL, not HEX.** The `globals.css` file's `--primary: 222.2 84% 4.9%` is hue saturation lightness. The spec's `#8B5CF6` converts to `258 90% 66%`. This was the primary mapping exercise.

2. **The current `globals.css` has default shadcn/ui values** (slate-gray scale, black text). Replacing the `.dark` block with cosmic indigo/purple/gold values will instantly transform the entire app's feel.

3. **Gold (#F5C451) should NOT be a shadcn/ui variable** — it's a brand accent used sparingly. Instead, add a custom `gold` color scale to `tailwind.config.ts` and use it via `text-gold-400`, `bg-gold-400/10`, etc.

4. **Split screen layout with RTL** is non-trivial. The left panel (content) appears on the RIGHT in RTL due to `dir="rtl"`. The component architecture must account for this — using Tailwind's `lg:[55%]` approach with flex direction.

5. **Multi-step registration** needs `AnimatePresence` from Framer Motion for smooth transitions between steps. The stagger timing (50ms between items, 300ms between steps) was specified.

## Evidence

User demonstrated understanding of:
- The HSL color system and conversion from HEX
- shadcn/ui's theming architecture (CSS variables → Tailwind classes)
- RTL layout implications (mirrored left/right panels)
- Component decomposition (22 components into structured folders)

## Implications

- Session 3 should be actual code writing — AuthLayout, LeftPanel, AuthCard, OAuthButtons
- User is ready to implement, not just theorize
- The `globals.css` update is the single highest-impact change they can make right now
