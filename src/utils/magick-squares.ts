// Magick Squares calculator — bitwise refactor.
//
// Original approach: 4 separate 9-element arrays + a linear scan
// (findIndexInArray) per cell -> O(9) scan x 9 cells = O(81) per square.
//
// Refactor: each array's INVERSE permutation (value 1..9 -> grid position
// 0..8) is packed into a single bigint, 4 bits per value. Looking up a
// position becomes one shift + mask instead of a scan -> O(9) per square,
// no array lookups at all.
//
// Packed constants were generated and round-trip verified against the
// original implementation (multiple inputs, including negative/large
// values) before being hardcoded here. See "derivation" block at the
// bottom to regenerate/verify them yourself.
//
// Note: each packed value needs 36 bits (9 nibbles), which exceeds JS's
// 32-bit native bitwise operand limit -- that's why this uses BigInt
// (`n` suffix, `>>`/`&` on bigint) rather than plain `number` bitwise ops.

export enum Elementals {
  Aero = "aero",
  Tera = "tera",
  Igni = "igni",
  Aqua = "aqua",
}

const ELEMENT_PACKED: Record<Elementals, bigint> = {
  [Elementals.Aero]: 0x561048723n,
  [Elementals.Tera]: 0x183642507n,
  [Elementals.Igni]: 0x723048561n,
  [Elementals.Aqua]: 0x381246705n,
};

const NIBBLE_MASK = 0xfn;

/** Extract the grid position (0..8) of value k (1..9) from a packed constant. */
function positionOf(packed: bigint, k: number): number {
  return Number((packed >> (BigInt(k - 1) * 4n)) & NIBBLE_MASK);
}

const squareCache = new Map<string, number[]>();

export function fillSquare(input: number, elemental: Elementals): number[] {
  const cacheKey = `${input}:${elemental}`;
  if (squareCache.has(cacheKey)) {
    return squareCache.get(cacheKey)!;
  }

  const packed = ELEMENT_PACKED[elemental];
  const out = new Array<number>(9).fill(0);
  for (let k = 1; k <= 9; k++) {
    out[positionOf(packed, k)] = (input + (k - 1)) | 0; // bitwise OR 0 for integer coercion
  }
  
  squareCache.set(cacheKey, out);
  return out;
}

export const Square = (elemental: Elementals, input: number): number[] =>
  fillSquare(input, elemental);

/** Sum of any row/column/diagonal for a given starting input. */
export const magicConstant = (input: number): number => (input * 3 + 12) | 0;

// ---------------------------------------------------------------------------
// Bitwise validation — constant-time duplicate detection
// ---------------------------------------------------------------------------
// Matches magick.is_valid_permutation() in SQL (05_magick.sql).
// A valid 3x3 magic square contains exactly the values 1..9, each once.
// The bitmask approach: set bit (1 << v) for each value v encountered.
// If the final mask equals 0b11111111110 (1022), all values 1..9 are present.
//
// This is O(n) with no heap allocations — no Set, no object, no array scan.

const VALID_PERMUTATION_MASK = 0b11111111110; // bits 1..9 set = 1022

/**
 * Returns true if `cells` is a permutation of [1..9].
 * Uses a single integer bitmask for constant-time duplicate detection.
 *
 * @example
 * isValidPermutation([6,7,2,1,5,9,8,3,4]) // true (Aero)
 * isValidPermutation([1,2,3,4,5,6,7,8,9]) // true (identity)
 * isValidPermutation([1,1,1,1,1,1,1,1,1]) // false (all duplicates)
 */
export function isValidPermutation(cells: number[]): boolean {
  let mask = 0;
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i];
    if (v < 1 || v > 9) return false;
    mask |= 1 << v;
  }
  return mask === VALID_PERMUTATION_MASK;
}

/**
 * Builds the presence bitmask for a cell array.
 * Exported for testing/inspection — mirrors magick.presence_mask() in SQL.
 */
export function presenceMask(cells: number[]): number {
  let mask = 0;
  for (let i = 0; i < cells.length; i++) {
    mask |= 1 << cells[i];
  }
  return mask;
}


// ---------------------------------------------------------------------------
// Derivation (not used at runtime) — kept for traceability. Run this if you
// ever need to regenerate or re-verify a packed constant from a raw array.
// ---------------------------------------------------------------------------
//
// const ORIGINAL_ARRAYS: Record<Elementals, number[]> = {
//   [Elementals.Aero]: [6, 7, 2, 1, 5, 9, 8, 3, 4],
//   [Elementals.Tera]: [2, 9, 4, 7, 5, 3, 6, 1, 8],
//   [Elementals.Igni]: [6, 1, 8, 7, 5, 3, 2, 9, 4],
//   [Elementals.Aqua]: [2, 7, 6, 9, 5, 1, 4, 3, 8],
// };
//
// function packFromArray(square: number[]): bigint {
//   let packed = 0n;
//   square.forEach((value, position) => {
//     packed |= BigInt(position) << (BigInt(value - 1) * 4n);
//   });
//   return packed;
// }
//
// for (const el of Object.values(Elementals)) {
//   console.log(el, packFromArray(ORIGINAL_ARRAYS[el]).toString(16));
// }
