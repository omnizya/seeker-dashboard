/**
 * Psychological State Machine
 * Tracks user journey: SCATTERED → PURIFYING → FOCUSED → FLOW → RESONANT
 */

import { STATE, type StateFlags } from "./constants";

export type PsychologicalState =
  | "SCATTERED"
  | "PURIFYING"
  | "FOCUSED"
  | "FLOW"
  | "RESONANT";

const STATE_MAP: Record<PsychologicalState, StateFlags> = {
  SCATTERED: 0,
  PURIFYING: STATE.TAHARAH,
  FOCUSED: STATE.RIYADAH,
  FLOW: STATE.FLOW,
  RESONANT: STATE.RESONANT,
};

const STATE_ORDER: readonly PsychologicalState[] = [
  "SCATTERED",
  "PURIFYING",
  "FOCUSED",
  "FLOW",
  "RESONANT",
] as const;

const VALID_TRANSITIONS: Record<PsychologicalState, PsychologicalState[]> = {
  SCATTERED: ["PURIFYING"],
  PURIFYING: ["SCATTERED", "FOCUSED"],
  FOCUSED: ["PURIFYING", "FLOW"],
  FLOW: ["FOCUSED", "RESONANT"],
  RESONANT: ["FLOW", "FOCUSED"],
};

interface StateEntry {
  state: PsychologicalState;
  timestamp: number;
}

export class StateMachine {
  private current: PsychologicalState = "SCATTERED";
  private history: StateEntry[] = [{ state: "SCATTERED", timestamp: Date.now() }];

  getState(): PsychologicalState {
    return this.current;
  }

  getStateBitmask(): StateFlags {
    return STATE_MAP[this.current];
  }

  transition(to: PsychologicalState): boolean {
    if (!VALID_TRANSITIONS[this.current].includes(to)) {
      return false;
    }
    this.history.push({ state: to, timestamp: Date.now() });
    this.current = to;
    return true;
  }

  reset(): void {
    this.current = "SCATTERED";
    this.history.push({ state: "SCATTERED", timestamp: Date.now() });
  }

  getHistory(): readonly StateEntry[] {
    return this.history;
  }

  getTimeInState(): number {
    const last = this.history[this.history.length - 1];
    return Date.now() - last.timestamp;
  }

  isAtOrBeyond(state: PsychologicalState): boolean {
    return STATE_ORDER.indexOf(this.current) >= STATE_ORDER.indexOf(state);
  }
}
