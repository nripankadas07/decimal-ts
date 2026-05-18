/**
 * Canonical string formatting for decimal values.
 *
 * Always emits plain decimal notation (no scientific), with a single
 * leading minus sign for negatives. Zero is always rendered as `"0"`
 * (or `"0.000…"` when {@link toFixed} requests trailing zeros).
 */

/** Render the value `coefficient × 10^exponent` as plain text. */
export function formatDecimal(
  coefficient: bigint,
  exponent: number,
): string {
  if (coefficient === 0n) return "0";
  const negative = coefficient < 0n;
  const absDigits = (negative ? -coefficient : coefficient).toString();
  const sign = negative ? "-" : "";
  if (exponent >= 0) {
    return sign + absDigits + "0".repeat(exponent);
  }
  const fracLen = -exponent;
  if (absDigits.length <= fracLen) {
    const padded = "0".repeat(fracLen - absDigits.length) + absDigits;
    return sign + "0." + padded;
  }
  const intLen = absDigits.length - fracLen;
  return sign + absDigits.slice(0, intLen) + "." + absDigits.slice(intLen);
}

/**
 * Render the value with exactly *scale* fractional digits.
 *
 * Assumes *coefficient* / *exponent* already encode a number that
 * has been rounded to *scale* digits (the caller is responsible for
 * doing the rounding). Trailing zeros are added or implied digits
 * are dropped to hit the target width exactly.
 */
export function formatFixed(
  coefficient: bigint,
  exponent: number,
  scale: number,
): string {
  // Re-scale coefficient so exponent == -scale (or 0 when scale == 0).
  const targetExp = -scale;
  let scaledCoef = coefficient;
  let scaledExp = exponent;
  while (scaledExp > targetExp) {
    scaledCoef = scaledCoef * 10n;
    scaledExp -= 1;
  }
  return formatDecimalAtTarget(scaledCoef, scaledExp, scale);
}

function formatDecimalAtTarget(
  coefficient: bigint,
  exponent: number,
  scale: number,
): string {
  if (scale === 0) {
    return formatDecimal(coefficient, exponent);
  }
  const negative = coefficient < 0n;
  const absDigits = (negative ? -coefficient : coefficient).toString();
  const sign = negative ? "-" : "";
  const padded = absDigits.length <= scale
    ? "0".repeat(scale - absDigits.length + 1) + absDigits
    : absDigits;
  const intLen = padded.length - scale;
  return sign + padded.slice(0, intLen) + "." + padded.slice(intLen);
}
