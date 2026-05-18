/**
 * Rounding kernel shared by division and `round()`.
 *
 * All seven {@link RoundingMode}s reduce to the same primitive:
 * "given that integer division of |num|/|denom| left a remainder
 * `r`, should the absolute quotient be bumped by 1?"
 *
 * Implementing that single decision in one place means every
 * surface — `Decimal.div`, `Decimal.round`, `Decimal.toFixed` — uses
 * exactly the same rounding behaviour.
 */

import { InvalidRoundingModeError } from "./errors";
import { ROUNDING_MODES, type RoundingMode } from "./types";

const VALID_MODES = new Set<RoundingMode>(ROUNDING_MODES);

/** Throw if *mode* is not a known {@link RoundingMode}. */
export function assertRoundingMode(mode: RoundingMode): RoundingMode {
  if (!VALID_MODES.has(mode)) {
    throw new InvalidRoundingModeError(mode);
  }
  return mode;
}

/**
 * Compute `round(num / denom, mode)`, returning the integer result.
 *
 * Handles negative numerators / denominators correctly: the rounding
 * decision is computed on the absolute remainder, the sign is then
 * reapplied. `FLOOR` and `CEIL` are sign-aware.
 *
 * Precondition: `denom !== 0n`. Caller is responsible for raising
 * {@link DivisionByZeroError} before calling.
 */
export function roundedDivide(
  num: bigint,
  denom: bigint,
  mode: RoundingMode,
): bigint {
  assertRoundingMode(mode);
  const negative = (num < 0n) !== (denom < 0n);
  const absNum = num < 0n ? -num : num;
  const absDenom = denom < 0n ? -denom : denom;
  const quotient = absNum / absDenom;
  const remainder = absNum - quotient * absDenom;
  if (remainder === 0n) {
    return negative ? -quotient : quotient;
  }
  const bump = shouldBump(mode, quotient, remainder, absDenom, negative);
  const magnitude = bump ? quotient + 1n : quotient;
  return negative ? -magnitude : magnitude;
}

function shouldBump(
  mode: RoundingMode,
  quotient: bigint,
  remainder: bigint,
  absDenom: bigint,
  negative: boolean,
): boolean {
  if (mode === "DOWN") return false;
  if (mode === "UP") return true;
  if (mode === "FLOOR") return negative;
  if (mode === "CEIL") return !negative;
  return shouldBumpHalf(mode, quotient, remainder, absDenom);
}

function shouldBumpHalf(
  mode: "HALF_UP" | "HALF_DOWN" | "HALF_EVEN" | RoundingMode,
  quotient: bigint,
  remainder: bigint,
  absDenom: bigint,
): boolean {
  const doubled = remainder * 2n;
  if (doubled < absDenom) return false;
  if (doubled > absDenom) return true;
  // Exact halfway case.
  if (mode === "HALF_UP") return true;
  if (mode === "HALF_DOWN") return false;
  // HALF_EVEN: bump when the would-be result is odd.
  return quotient % 2n !== 0n;
}
