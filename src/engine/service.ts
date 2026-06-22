/**
 * LodgeService — High-level API connecting LodgeKernel to SaaS
 *
 * Provides session management, semantic/geometric operations,
 * state transitions, and yield calculation through a clean interface.
 */

import { LodgeKernel, type WafqResult } from "./kernel";
import { StateMachine, type PsychologicalState } from "./state-machine";
import {
  ARCHETYPES,
  ELEMENTS,
  type ArchetypeName,
  type Element,
} from "./constants";

import { CalcJomal } from "~/utils/jummal";
import {
  Elementals,
  magicConstant,
} from "~/utils/magick-squares";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LodgeSession {
  userId: string;
  intent: string;
  masterSeed: number;
  wafq: WafqResult | null;
  magicConst: number;
  archetype: ArchetypeName;
  state: PsychologicalState;
  element: Element;
  createdAt: number;
}

export interface YieldResult {
  totalYield: number;
  flowTime: number;
  interruptions: number;
  resonance: boolean;
  archetype: ArchetypeName;
}

// ---------------------------------------------------------------------------
// Element ↔ Elementals mapping
// ---------------------------------------------------------------------------

const ELEMENT_TO_ELEMENTAL: Record<Element, Elementals> = {
  [ELEMENTS.EARTH]: Elementals.Tera,
  [ELEMENTS.WATER]: Elementals.Aqua,
  [ELEMENTS.AIR]: Elementals.Aero,
  [ELEMENTS.FIRE]: Elementals.Igni,
};

// ---------------------------------------------------------------------------
// LodgeService
// ---------------------------------------------------------------------------

export class LodgeService {
  private kernel: LodgeKernel;
  private stateMachine: StateMachine;
  private session: LodgeSession | null = null;

  constructor() {
    this.kernel = new LodgeKernel();
    this.stateMachine = new StateMachine();
  }

  // ----- Session Management -----

  startSession(
    userId: string,
    intent: string,
    archetype: ArchetypeName = "SATURNIAN_ARCHITECT",
    element: Element = ELEMENTS.EARTH,
  ): LodgeSession {
    const masterSeed = this.computeIntentSeed(intent);
    this.kernel.setMasterSeed(masterSeed);

    const wafq = this.generateWafq(masterSeed, element);

    this.session = {
      userId,
      intent,
      masterSeed,
      wafq,
      magicConst: wafq.magicConst,
      archetype,
      state: this.stateMachine.getState(),
      element,
      createdAt: Date.now(),
    };

    return this.session;
  }

  getSession(): LodgeSession | null {
    return this.session;
  }

  // ----- Semantic Engine -----

  computeIntentSeed(input: string): number {
    return this.kernel.computeMasterSeed(input);
  }

  getAbjadBreakdown(input: string): number[] {
    const result = CalcJomal(input);
    return [result.ge, result.gw, result.se, result.sw, result.n];
  }

  // ----- Geometric Engine -----

  generateWafq(seed: number, element: Element): WafqResult {
    const elemental = ELEMENT_TO_ELEMENTAL[element];
    return this.kernel.generateWafq(seed, elemental);
  }

  validateWafq(cells: number[], base: number): { valid: boolean; errors: string[] } {
    const mc = magicConstant(base);
    const result = this.kernel.validateWafq(cells);
    if (result.valid && mc !== 15) {
      const expectedMc = magicConstant(cells[0]);
      if (expectedMc !== mc) {
        result.valid = false;
        result.errors.push(`Magic constant mismatch: expected ${mc}, got ${expectedMc}`);
      }
    }
    return result;
  }

  checkResonance(
    cells: number[],
    completion: number,
    threshold: number = 1.0,
  ): { resonant: boolean; multiplier: number } {
    const { resonant, multiplier } = this.kernel.checkResonance(cells);
    const resonantWithCompletion = resonant && completion >= threshold;
    return {
      resonant: resonantWithCompletion,
      multiplier: resonantWithCompletion ? multiplier : 1.0,
    };
  }

  // ----- State Management -----

  getState(): PsychologicalState {
    return this.stateMachine.getState();
  }

  transitionState(to: PsychologicalState): boolean {
    const success = this.stateMachine.transition(to);
    if (success && this.session) {
      this.session.state = to;
    }
    return success;
  }

  resetState(): void {
    this.stateMachine.reset();
    if (this.session) {
      this.session.state = "SCATTERED";
    }
  }

  // ----- Archetype Management -----

  setArchetype(archetype: ArchetypeName): void {
    if (this.session) {
      this.session.archetype = archetype;
    }
  }

  getArchetypeModifier(archetype: ArchetypeName) {
    return ARCHETYPES[archetype];
  }

  // ----- Yield Calculation -----

  calculateYield(
    durationTicks: number,
    interruptions: number,
    resonance: boolean,
  ): YieldResult {
    const archetype = this.session?.archetype ?? "SATURNIAN_ARCHITECT";
    const resonanceMultiplier = resonance ? 1.5 : 1.0;
    const totalYield = this.kernel.calculateTransmutation(
      archetype,
      durationTicks,
      resonanceMultiplier,
      1.0,
    );

    return {
      totalYield,
      flowTime: durationTicks,
      interruptions,
      resonance,
      archetype,
    };
  }

  // ----- Serialization -----

  serialize(): Uint8Array {
    return this.kernel.serialize();
  }

  deserialize(data: Uint8Array): void {
    this.kernel.deserialize(data);
  }

  // ----- Accessors -----

  getKernel(): LodgeKernel {
    return this.kernel;
  }

  getStateMachine(): StateMachine {
    return this.stateMachine;
  }
}
