/**
 * LodgeKernel — Core computational engine for the Lodge Protocol
 *
 * Four engines: Semantic, Geometric, Chronometric, State
 * Plus: Flow State Model, Resonance System, Transmutation Equation, Binary Serialization
 */

import {
  IQRA_SEED,
  STATE,
  PLANETS,
  CHALDEAN_ORDER,
  DAY_RULERS,
  ARCHETYPES,
  LODGE_STATE_SIZE,
  SLOT,
  type ArchetypeName,
  type ArchetypeModifier,
} from "./constants";

import {
  fillSquare,
  Elementals,
  isValidPermutation,
  magicConstant,
} from "~/utils/magick-squares";

// ---------------------------------------------------------------------------
// Abjad Lookup Table (O(1) character access via Uint16Array)
// ---------------------------------------------------------------------------
// Abjad numerals: Arabic letter → traditional numeric value.
// Indexed by (codePoint - 0x0621) for Arabic block 0621-064A.
// Out-of-range indices return 0.

const ARABIC_BLOCK_START = 0x0621; // ء
const ARABIC_BLOCK_END = 0x064a;   // ي
const ARABIC_BLOCK_SIZE = ARABIC_BLOCK_END - ARABIC_BLOCK_START + 1;

const abjadTable = new Uint16Array(ARABIC_BLOCK_SIZE);

// Initialize: Abjad values for ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
const ABDJAD_VALUES = [
  1, 2, 400, 500, 3, 8, 600, 4, 6, 200, 7, 60, 300, 10, 9, 400, 500, 70,
  800, 100, 20, 30, 40, 50, 5, 6, 7,
];

for (let i = 0; i < ABDJAD_VALUES.length && i < ARABIC_BLOCK_SIZE; i++) {
  abjadTable[i] = ABDJAD_VALUES[i];
}

function abjadValue(char: string): number {
  const cp = char.codePointAt(0) ?? 0;
  if (cp >= ARABIC_BLOCK_START && cp <= ARABIC_BLOCK_END) {
    return abjadTable[cp - ARABIC_BLOCK_START];
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LodgeState {
  flags: number;
  planetMask: number;
  archetype: number;
  element: number;
  energies: Uint32Array;
  timestamp: number;
  counter: number;
}

export interface WafqResult {
  cells: number[];
  elemental: Elementals;
  magicConst: number;
  isValid: boolean;
  resonanceMultiplier: number;
}

// ---------------------------------------------------------------------------
// LodgeKernel
// ---------------------------------------------------------------------------

export class LodgeKernel {
  private memory: Uint32Array;
  private masterSeed: number;
  private abjadSumCache: Map<string, number>;

  constructor(seed: number = IQRA_SEED) {
    this.memory = new Uint32Array(LODGE_STATE_SIZE);
    this.masterSeed = seed;
    this.abjadSumCache = new Map();
  }

  // ----- State Management -----

  setState(flag: number): void {
    this.memory[SLOT.STATE_FLAGS] |= flag;
  }

  hasState(flag: number): boolean {
    return (this.memory[SLOT.STATE_FLAGS] & flag) === flag;
  }

  clearState(flag: number): void {
    this.memory[SLOT.STATE_FLAGS] &= ~flag;
  }

  isReady(): boolean {
    return this.memory[SLOT.STATE_FLAGS] !== 0;
  }

  // ----- Semantic Engine -----

  computeAbjadSum(text: string): number {
    const cached = this.abjadSumCache.get(text);
    if (cached !== undefined) return cached;

    let sum = 0;
    for (const ch of text) {
      sum += abjadValue(ch);
    }
    this.abjadSumCache.set(text, sum);
    return sum;
  }

  computeMasterSeed(text: string): number {
    const abjadSum = this.computeAbjadSum(text);
    return (abjadSum + this.masterSeed) | 0;
  }

  setMasterSeed(seed: number): void {
    this.masterSeed = seed | 0;
  }

  getMasterSeed(): number {
    return this.masterSeed;
  }

  // ----- Geometric Engine -----

  generateWafq(input: number, elemental: Elementals): WafqResult {
    const cells = fillSquare(input, elemental);
    const magicConst = magicConstant(input);
    const isValid = isValidPermutation(cells);

    return {
      cells,
      elemental,
      magicConst,
      isValid,
      resonanceMultiplier: 1.0,
    };
  }

  validateWafq(cells: number[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (cells.length !== 9) {
      errors.push(`Expected 9 cells, got ${cells.length}`);
    }

    if (!isValidPermutation(cells)) {
      errors.push("Not a valid permutation of [1..9]");
    }

    // Check magic constant (all rows, cols, diags sum to same value)
    const expectedSum = cells[0] + cells[1] + cells[2];
    const checks = [
      [3, 4, 5], // row 2
      [6, 7, 8], // row 3
      [0, 3, 6], // col 1
      [1, 4, 7], // col 2
      [2, 5, 8], // col 3
      [0, 4, 8], // diag 1
      [2, 4, 6], // diag 2
    ];

    for (const [a, b, c] of checks) {
      if (cells[a] + cells[b] + cells[c] !== expectedSum) {
        errors.push(`Magic sum mismatch at indices [${a},${b},${c}]`);
        break;
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ----- Chronometric Engine -----

  getPlanetaryHourIndex(date: Date = new Date()): number {
    const dayOfWeek = date.getDay(); // 0=Sun
    const hoursSinceMidnight = date.getHours() + date.getMinutes() / 60;
    const daylightHours = 12;
    const planetaryHoursPerDay = 7;
    const hourIndex =
      (dayOfWeek * planetaryHoursPerDay +
        Math.floor((hoursSinceMidnight / daylightHours) * planetaryHoursPerDay)) %
      planetaryHoursPerDay;
    return hourIndex;
  }

  getRulingPlanet(date: Date = new Date()): string {
    const hourIndex = this.getPlanetaryHourIndex(date);
    return CHALDEAN_ORDER[hourIndex % CHALDEAN_ORDER.length];
  }

  getDayRuler(date: Date = new Date()): string {
    return DAY_RULERS[date.getDay() % DAY_RULERS.length];
  }

  // ----- State Engine -----

  calculateCognitiveLoad(): number {
    const flags = this.memory[SLOT.STATE_FLAGS];
    let load = 0;
    // Each active state flag adds cognitive load
    for (let bit = 0; bit < 7; bit++) {
      if (flags & (1 << bit)) load += 0.15;
    }
    return Math.min(load, 1.0);
  }

  checkReadiness(): boolean {
    const flags = this.memory[SLOT.STATE_FLAGS];
    // Must have at least TAHARAH and one archetype active
    const hasTaharah = (flags & STATE.TAHARAH) !== 0;
    const hasArchetype =
      (flags & STATE.ARCHITECT) !== 0 ||
      (flags & STATE.EXPLORER) !== 0 ||
      (flags & STATE.CRUSADER) !== 0;
    return hasTaharah && hasArchetype;
  }

  // ----- Flow State Model -----
  // F(t) = F_max(1 - e^(-kt))
  // F_true(t) = F(t) × ∏(1 - I_t)

  calculateFlow(
    archetype: ArchetypeName,
    t: number,
    interruptions: number = 0,
  ): { F: number; F_true: number } {
    const params: ArchetypeModifier = ARCHETYPES[archetype];
    const F = params.F_max * (1 - Math.exp(-params.k * t));
    const interruptionFactor = Math.pow(1 - 0.1, interruptions);
    const F_true = F * interruptionFactor;
    return { F, F_true };
  }

  calculateYield(
    archetype: ArchetypeName,
    t: number,
    interruptions: number = 0,
    activity: number = 1.0,
  ): number {
    const { F_true } = this.calculateFlow(archetype, t, interruptions);
    return F_true * activity;
  }

  // ----- Resonance System -----
  // R_W = 1.5 if min(rows, cols, diags) ≥ μ, else 1.0

  checkResonance(cells: number[]): { resonant: boolean; multiplier: number } {
    if (cells.length !== 9) {
      return { resonant: false, multiplier: 1.0 };
    }

    const mc = magicConstant(cells[0]);
    const mu = mc / 3; // threshold = magic constant / 3

    const rowSums = [
      cells[0] + cells[1] + cells[2],
      cells[3] + cells[4] + cells[5],
      cells[6] + cells[7] + cells[8],
    ];
    const colSums = [
      cells[0] + cells[3] + cells[6],
      cells[1] + cells[4] + cells[7],
      cells[2] + cells[5] + cells[8],
    ];
    const diagSums = [
      cells[0] + cells[4] + cells[8],
      cells[2] + cells[4] + cells[6],
    ];

    const allSums = [...rowSums, ...colSums, ...diagSums];
    const minSum = Math.min(...allSums);

    const resonant = minSum >= mu;
    return { resonant, multiplier: resonant ? 1.5 : 1.0 };
  }

  // ----- Transmutation Equation -----
  // ΔG = T × R_W × ∫₀ᵀ F_true(t) × A(t) dt
  // Approximated via discrete sum over time steps

  calculateTransmutation(
    archetype: ArchetypeName,
    T: number,
    resonanceMultiplier: number,
    activity: number = 1.0,
    steps: number = 100,
  ): number {
    const dt = T / steps;
    let integral = 0;

    for (let i = 0; i < steps; i++) {
      const t = i * dt;
      const { F_true } = this.calculateFlow(archetype, t);
      integral += F_true * activity * dt;
    }

    return T * resonanceMultiplier * integral;
  }

  // ----- Binary Serialization -----

  serialize(): Uint8Array {
    const buf = new Uint8Array(LODGE_STATE_SIZE * 4);
    const view = new DataView(buf.buffer);
    for (let i = 0; i < LODGE_STATE_SIZE; i++) {
      view.setUint32(i * 4, this.memory[i], true);
    }
    return buf;
  }

  deserialize(data: Uint8Array): void {
    const view = new DataView(data.buffer);
    const len = Math.min(LODGE_STATE_SIZE, Math.floor(data.length / 4));
    for (let i = 0; i < len; i++) {
      this.memory[i] = view.getUint32(i * 4, true);
    }
  }

  getMemory(): Readonly<Uint32Array> {
    return this.memory;
  }
}
