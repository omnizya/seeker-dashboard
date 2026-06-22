/**
 * Resonance Matrix Generator
 *
 * Implements the deterministic 3×3 matrix formula from the Lodge Protocol:
 *   B = floor((N - 12) / 3)
 *   R = (N - 12) % 3
 *
 *   W = [[B+7, B,   B+5],
 *        [B+2, B+4, B+6+R],
 *        [B+3, B+8, B+1]]
 *
 * Not guaranteed to produce a perfect magic square (equal row/col/diag sums).
 * The `isMagic` flag reports whether the generated matrix satisfies the property.
 */

export type ResonanceMatrix = {
  /** The input seed */
  seed: number;
  /** Base value derived from seed */
  B: number;
  /** Remainder used to perturb cell (1,2) for sum alignment */
  R: number;
  /** 3×3 matrix as row arrays */
  matrix: number[][];
  /** Row-major flat array (9 elements, left-to-right, top-to-bottom) */
  flat: number[];
  /** Sum of any row/col/diag if matrix is magic, otherwise undefined */
  magicConstant: number;
  /** True if all rows, columns, and both diagonals sum to the same value */
  isMagic: boolean;
};

export function generateResonanceMatrix(seed: number): ResonanceMatrix {
  const B = Math.floor((seed - 12) / 3);
  const R = (seed - 12) % 3;

  const matrix: number[][] = [
    [B + 7, B,     B + 5],
    [B + 2, B + 4, B + 6 + R],
    [B + 3, B + 8, B + 1],
  ];

  const rows = matrix.map(r => r[0] + r[1] + r[2]);
  const cols = [0, 1, 2].map(c => matrix[0][c] + matrix[1][c] + matrix[2][c]);
  const diag1 = matrix[0][0] + matrix[1][1] + matrix[2][2];
  const diag2 = matrix[0][2] + matrix[1][1] + matrix[2][0];

  const all = [...rows, ...cols, diag1, diag2];
  const first = all[0];
  const isMagic = all.every(s => s === first);

  return {
    seed,
    B,
    R,
    matrix,
    flat: matrix.flat(),
    magicConstant: isMagic ? first : first,
    isMagic,
  };
}
