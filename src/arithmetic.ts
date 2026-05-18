/**
 * Pure arithmetic helpers on `(coefficient, exponent)` pairs.
 *
 * Kept separate from the `Decimal` class so they can be tested in
 * isolation and reused by future surfaces (e.g. a fluent builder).
 */

import { DivisionByZeroError, InvalidScaleError } from "./errors";
import { roundedDivide } from "./rounding";
import type { RoundingMode } from "./types";

interface Pair {
  readonly coefficient: bigint;
  readonly exponent: number;
}

/** Multiply *coefficient* by `10^n` (n must be ≥ 0). */
export function shiftLeft(coefficient: bigint, n: number): bigint {
  if (n <= 0) return coefficient;
  return coefficient * pow10(n);
}

/** Memo for `10^n`, n up to a reasonable limit. */
const POW10_CACHE: bigint[] = [1n];

export function pow10(n: number): bigint {
  // Caller contract: n >= 0. Internal callers ensure this; we don't
  // re-validate here to keep the hot path branch-free.
  while (POW10_CACHE.length <= n) {
    const last = POW10_CACHE[POW10_CACHE.length - 1] as bigint;
    POW10_CACHE.push(last * 10n);
  }
  return POW10_CACHE[n] as bigint;
}

/** Align *a* and *b* to a common exponent (the more negative of the two). */
export function align(a: Pair, b: Pair): {
  aCoef: bigint;
  bCoef: bigint;
  exponent: number;
} {
  const exponent = Math.min(a.exponent, b.exponent);
  const aCoef = shiftLeft(a.coefficient, a.exponent - exponent);
  const bCoef = shiftLeft(b.coefficient, b.exponent - exponent);
  return { aCoef, bCoef, exponent };
}

/** Return the sum *a + b* without normalisation. */
export function addPairs(a: Pair, b: Pair): Pair {
  const { aCoef, bCoef, exponent } = align(a, b);
  return { coefficient: aCoef + bCoef, exponent };
}

/** Return the difference *a − b* without normalisation. */
export function subPairs(a: Pair, b: Pair): Pair {
  const { aCoef, bCoef, exponent } = align(a, b);
  return { coefficient: aCoef - bCoef, exponent };
}

/** Return the product *a × b* without normalisation. */
export function mulPairs(a: Pair, b: Pair): Pair {
  return {
    coefficient: a.coefficient * b.coefficient,
    exponent: a.exponent + b.exponent,
  };
}

/**
 * Divide *a* by *b* returning a result with exactly *scale* fractional
 * digits, rounded with *mode*.
 *
 * @throws {DivisionByZeroError} when *b* is zero.
 * @throws {InvalidScaleError} when *scale* is negative or non-integer.
 */
export function divPairs(
  a: Pair,
  b: Pair,
  scale: number,
  mode: RoundingMode,
): Pair {
  assertScale(scale);
  if (b.coefficient === 0n) {
    throw new DivisionByZeroError();
  }
  const targetExponent = -scale;
  const shift = a.exponent - b.exponent - targetExponent;
  const { num, denom } = stageDivision(a.coefficient, b.coefficient, shift);
  const coefficient = roundedDivide(num, denom, mode);
  return { coefficient, exponent: targetExponent };
}

function stageDivision(
  aCoef: bigint,
  bCoef: bigint,
  shift: number,
): { num: bigint; denom: bigint } {
  if (shift >= 0) {
    return { num: shiftLeft(aCoef, shift), denom: bCoef };
  }
  return { num: aCoef, denom: shiftLeft(bCoef, -shift) };
}

/**
 * Truncated-division remainder *a mod b*: same sign as *a*, magnitude
 * strictly less than that of *b*.
 *
 * @throws {DivisionByZeroError} when *b* is zero.
 */
export function modPairs(a: Pair, b: Pair): Pair {
  if (b.coefficient === 0n) {
    throw new DivisionByZeroError();
  }
  const { aCoef, bCoef, exponent } = align(a, b);
  const absB = bCoef < 0n ? -bCoef : bCoef;
  const sign = aCoef < 0n ? -1n : 1n;
  const absA = aCoef < 0n ? -aCoef : aCoef;
  const remainder = absA - (absA / absB) * absB;
  return { coefficient: sign * remainder, exponent };
}

/** Compare *a* and *b*: returns ‑1, 0, or 1. */
export function comparePairs(a: Pair, b: Pair): number {
  const { aCoef, bCoef } = align(a, b);
  if (aCoef < bCoef) return -1;
  if (aCoef > bCoef) return 1;
  return 0;
}

export function assertScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 0) {
    throw new InvalidScaleError(scale);
  }
}
