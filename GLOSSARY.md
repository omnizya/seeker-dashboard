# Auth & Onboarding Design Glossary

Key terms used throughout this teaching series for the platform "الباحث (seeker)".

## Emotional Journey

**Initiation Moment**: The psychological framing of authentication as the beginning of a meaningful transformation, not a transactional form submission. The user should feel they are starting a journey, not filling out a form.

**Progressive Disclosure**: Revealing information and choices step-by-step rather than all at once. Used in the multi-step registration flow to prevent overwhelm and increase completion rates.

**Transformational Outcome**: A concrete benefit the user will experience after completing auth, displayed as aspirational content (e.g., "Discover your natal blueprint" rather than "Learn astrology").

## Design System

**Design Token**: A named, reusable value that defines a visual design property — color, typography, spacing, shadow, border radius. Tokens exist in three layers: primitive (raw values), semantic (contextual meaning), and component (specific usage).

**Cosmic Indigo**: The primary brand color — a deep, saturated blue-purple (#1a1a2e to #16213e range) that evokes night sky, depth, and the infinite. Communicates wisdom and mystery without occult clichés.

**Near-Black Blue**: The background color — extremely dark (#0a0a1a range) with a subtle blue tint. Provides a premium, infinite-depth canvas that makes gold accents and soft ivory text pop.

**Soft Ivory**: The primary text color — warm off-white (#f5f0e8 range) rather than pure white. Softer on the eyes, more premium feel, evokes aged parchment and celestial light.

**Mystic Purple**: The secondary brand color used for gradients, hover states, and secondary elements. Bridges the indigo primary and cosmic theme.

**Gold Accent**: The tertiary/interactive color used for CTAs, achievements, highlights, and symbols. Evokes alchemical gold, enlightenment, premium value.

## Gamification

**XP (Experience Points)**: Numeric score awarded for completing actions. In this context, initial 100 XP granted as a registration reward.

**Seeker Identity**: The personalized beginner title generated after registration (e.g., "Apprentice", "Seeker", "Student of Wisdom"). Establishes the user's role in the learning journey.

**Achievement Unlock**: A badge or milestone earned by completing specific actions. First achievement: "First Step Taken" for completing registration.

## UX Patterns

**Social Login Layering**: Placing OAuth buttons (Google, Apple, GitHub) above email/password forms to reduce friction for returning users. Mobile-first pattern.

**Passkey Support**: WebAuthn-based passwordless authentication using device biometrics. Displayed as a premium, modern auth option.

**Empty State**: The state of a UI element before the user has taken action (e.g., no bookmarks, no journal entries). Must be designed to encourage action, not show emptiness.

**Error State**: The UI response when something goes wrong. Must be informative, reassuring, and actionable — never alarming or technical.

**Success State**: The UI response when an action completes successfully. Should celebrate the moment and clearly show what happens next.
