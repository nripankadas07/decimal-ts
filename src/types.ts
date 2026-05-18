/**
 * Public type definitions for the `decimal-ts` package.
 *
 * Kept in a dedicated module so they can be imported without pulling
 * in the runtime `Decimal` class — useful for type-only consumers.
 */

/**
 * Rounding mode used by {@link Decimal.div}, {@link Decimal.round},
 * and {@link Decimal.toFixed}.
 *
 *  - `'DOWN'`       — toward zero (truncation).
 *  - `'UP'`         — away from zero.
 *  - `'FLOOR'`      — toward negative infinity.
 *  - `'CEIL'`       — toward positive infinity.
 *  - `'HALF_UP'`    — nearest; ties go away from zero (commercial).
 *  - `'HALF_DOWN'`  — nearest; ties go toward zero.
 *  - `'HALF_EVEN'`  — nearest; ties go to even digit (banker's).
 */
export type RoundingMode =
  | "DOWN"
  | "UP"
  | "FLOOR"
  | "CEIL"
  | "HALF_UP"
  | "HALF_DOWN"
  | "HALF_EVEN";

/** Any value `Decimal.from` can convert. */
export type DecimalInput = string | number | bigint | { readonly coefficient: bigint; readonly exponent: number };

/** Frozen tuple of every legal {@link RoundingMode} value. */
export const ROUNDING_MODES: readonly RoundingMode[] = [
  "DOWN",
  "UP",
  "FLOOR",
  "CEIL",
  "HALF_UP",
  "HALF_DOWN",
  "HALF_EVEN",
] as const;
