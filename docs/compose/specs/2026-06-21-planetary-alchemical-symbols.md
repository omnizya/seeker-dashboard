# Planetary Alchemical Symbols Spec

## Context

The dashboard displays planetary hours (`PlanetaryHoursCard.tsx`) which map each hour to one of 7 classical planets. We needed SVG icon components to visually represent these planets with their traditional alchemical symbols and colors.

## The 7 Planets (Chaldean Order)

| Planet (en) | Arabic | Alchemical Metal | Symbol | Meaning |
|---|---|---|---|---|
| Saturn | زحل | Lead (رصاص) | ♄ | Cross of matter + semicircle of spirit |
| Jupiter | المشتري | Tin (قصدير) | ♃ | Cross + curved top (like number 4) |
| Mars | المريخ | Iron (حديد) | ♂ | Circle (spirit) + arrow (energy/direction) |
| Sun | الشمس | Gold (ذهب) | ☉ | Circle with center dot (perfection) |
| Venus | الزهرة | Copper (نحاس) | ♀ | Circle (spirit) + cross (matter) |
| Mercury | عطارد | Quicksilver (زئبق) | ☿ | Circle + cross + caduceus wings |
| Moon | القمر | Silver (فضة) | ☽ | Crescent (waxing) |

## Alchemical Colors

| Planet | Color | Hex | Element |
|---|---|---|---|
| Saturn | Lead Gray | `#4A4A4A` | Earth |
| Jupiter | Slate Blue | `#7B68EE` | Air |
| Mars | Crimson | `#DC143C` | Fire |
| Sun | Gold | `#FFD700` | Fire |
| Venus | Sea Green | `#2E8B57` | Water |
| Mercury | Light Steel Blue | `#A8D8EA` | Water/Mercurial |
| Moon | Silver | `#C0C0C0` | Water |

## SVG Symbol Construction (24×24 viewBox)

### Saturn ♄
```
M 6 6 A 6 6 0 0 1 18 6   — semicircle cap (opens downward)
M 12 6 L 12 20            — vertical stem
M 6 14 L 18 14            — crossbar
```

### Jupiter ♃
```
M 12 7 L 12 20            — vertical stem
M 12 7 Q 8 7 8 11         — top hook (curves left)
M 6 14 L 18 14            — crossbar
```

### Mars ♂
```
M 15.5 8 A 3.5 3.5 0 1 1 8.5 8 A 3.5 3.5 0 1 1 15.5 8 z  — circle
M 13.5 9.5 L 21 2                                           — arrow shaft
M 17 2 L 21 2 L 20 5                                        — arrowhead
```

### Sun ☉
```
M 18 12 A 6 6 0 1 1 6 12 A 6 6 0 1 1 18 12 z  — outer circle
M 13 12 A 1.5 1.5 0 1 1 10 12 A 1.5 1.5 0 1 1 13 12 z  — center dot
```

### Venus ♀
```
M 16 7 A 4 4 0 1 1 8 7 A 4 4 0 1 1 16 7 z  — circle
M 12 11 L 12 20                              — vertical stem
M 7.5 16 L 16.5 16                           — crossbar
```

### Mercury ☿
```
M 15.5 7 A 3.5 3.5 0 1 1 8.5 7 A 3.5 3.5 0 1 1 15.5 7 z  — circle
M 12 10.5 L 12 19                                            — vertical stem
M 7.5 14.5 L 16.5 14.5                                       — crossbar
M 12 16 Q 9 16 9 13                                          — left caduceus wing
M 12 16 Q 15 16 15 13                                        — right caduceus wing
```

### Moon ☽
Crescent via two arcs:
```
M 17 12 A 7 7 0 1 1 7 19 A 5 5 0 1 0 17 12 Z
```
Or simpler path approach:
```
M 17 5a7 7 0 1 0 2 14 5 5 0 1 1-2-14z
```

## Component Architecture

File: `src/components/Icons/PlanetIcons.tsx`

- `PlanetName` type: `"Saturn" | "Jupiter" | "Mars" | "Sun" | "Venus" | "Mercury" | "Moon"`
- `PLANET_COLORS` constant map: `Record<PlanetName, string>`
- `PlanetIcon` component: Takes `planet: PlanetName` + standard SVG props
- `getPlanetPath(planet: PlanetName): string` — returns the SVG path `d` attribute
- Individual named exports: `SaturnIcon`, `JupiterIcon`, etc.

Usage:
```tsx
import { PlanetIcon, PLANET_COLORS } from "~/components/Icons/PlanetIcons";

<PlanetIcon planet="Saturn" className="w-6 h-6" />
```

## Source

SVG path data extracted from Wikimedia Commons: `Astrological_Glyphs.svg` (Inkscape source).
Unicode codepoints for reference: U+263F–U+2649 (Miscellaneous Symbols block).
