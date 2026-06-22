/**
 * Lodge Protocol Constants & Types
 * Bitwise state management with Uint32Array bitmasks
 */

// Seed value derived from "اقرأ" (Iqra)
export const IQRA_SEED = 302;

// Bitwise state flags
export const STATE = {
  TAHARAH: 1 << 0,    // Purity
  RIYADAH: 1 << 1,    // Spiritual exercise
  RESONANT: 1 << 2,   // Resonance state
  FLOW: 1 << 3,       // Flow state
  ARCHITECT: 1 << 4,  // Saturnian Architect active
  EXPLORER: 1 << 5,   // Mercurial Explorer active
  CRUSADER: 1 << 6,   // Martial Crusader active
} as const;

export type StateFlags = (typeof STATE)[keyof typeof STATE];

// Planet bitmasks (7 bits for 7 planets)
export const PLANETS = {
  SATURN: 1 << 0,
  JUPITER: 1 << 1,
  MARS: 1 << 2,
  SUN: 1 << 3,
  VENUS: 1 << 4,
  MERCURY: 1 << 5,
  MOON: 1 << 6,
} as const;

export type PlanetFlags = (typeof PLANETS)[keyof typeof PLANETS];

// Chaldean order of planets
export const CHALDEAN_ORDER: readonly string[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
] as const;

// Day rulers (Sunday = 0)
export const DAY_RULERS: readonly string[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
] as const;

// Archetype modifiers
export interface ArchetypeModifier {
  k: number;       // Flow coefficient
  F_max: number;   // Maximum force
  stability: number; // Stability factor
}

export const ARCHETYPES = {
  SATURNIAN_ARCHITECT: {
    k: 0.02,
    F_max: 80,
    stability: 0.9,
  },
  MERCURIAL_EXPLORER: {
    k: 0.15,
    F_max: 60,
    stability: 0.3,
  },
  MARTIAL_CRUSADER: {
    k: 0.08,
    F_max: 150,
    stability: 0.1,
  },
} as const;

export type ArchetypeName = keyof typeof ARCHETYPES;

// Celestial elements
export const ELEMENTS = {
  EARTH: 0,
  WATER: 1,
  AIR: 2,
  FIRE: 3,
} as const;

export type Element = (typeof ELEMENTS)[keyof typeof ELEMENTS];

// Lodge state size for Uint32Array
export const LODGE_STATE_SIZE = 1024;

// Binary layout slot constants
export const SLOT = {
  STATE_FLAGS: 0,      // bits 0-6
  PLANET_MASK: 1,      // bits 7-13
  ARCHETYPE: 2,        // bits 14-15
  ELEMENT: 3,          // bits 16-17
  ENERGIES: 4,         // bits 18-49 (32-bit energy block)
  TIMESTAMP: 5,        // bits 50-81 (32-bit timestamp)
  COUNTER: 6,          // bits 82-113 (32-bit counter)
} as const;

export type SlotIndex = (typeof SLOT)[keyof typeof SLOT];
