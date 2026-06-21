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
