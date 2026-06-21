import { CalcJomalT } from "~/types";
import { JummalTable } from "~/data/jummal";

// Pre-compute lookup tables for O(1) character lookup using typed arrays
const MAX_CHAR_CODE = 1611;
const GE_TABLE = new Int32Array(MAX_CHAR_CODE);
const GW_TABLE = new Int32Array(MAX_CHAR_CODE);
const LE_TABLE = new Int32Array(MAX_CHAR_CODE);
const LW_TABLE = new Int32Array(MAX_CHAR_CODE);
const N_TABLE = new Int32Array(MAX_CHAR_CODE);

for (let i = 0; i < JummalTable.length; i++) {
  const [char, ge, gw, le, lw, n] = JummalTable[i];
  const code = (char as string).charCodeAt(0);
  if (code < MAX_CHAR_CODE) {
    GE_TABLE[code] = ge as number;
    GW_TABLE[code] = gw as number;
    LE_TABLE[code] = le as number;
    LW_TABLE[code] = lw as number;
    N_TABLE[code] = n as number;
  }
}

// Memoization cache for dynamic programming caching
const memoCache = new Map<string, CalcJomalT>();

export function CalcJomal(input: string | string[]): CalcJomalT {
  const str = Array.isArray(input) ? input.join("") : input;
  
  if (memoCache.has(str)) {
    return memoCache.get(str)!;
  }

  let ge = 0, gw = 0, se = 0, sw = 0, n = 0;

  for (let i = 0, len = str.length; i < len; i++) {
    // Byte code usage for speed
    const code = str.charCodeAt(i);
    if (code < MAX_CHAR_CODE) {
      // Bitwise OR 0 ensures integer arithmetic optimization
      ge = (ge + GE_TABLE[code]) | 0;
      gw = (gw + GW_TABLE[code]) | 0;
      se = (se + LE_TABLE[code]) | 0;
      sw = (sw + LW_TABLE[code]) | 0;
      n = (n + N_TABLE[code]) | 0;
    }
  }

  const result: CalcJomalT = { ge, gw, se, sw, n };
  memoCache.set(str, result);
  return result;
}
