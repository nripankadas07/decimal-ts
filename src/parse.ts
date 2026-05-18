/**
 * Parser for decimal literal strings.
 *
 * Accepted shapes:
 *
 *   - integer:  `123`, `-7`, `+0`
 *   - fraction: `1.5`, `.5`, `5.`, `-0.001`
 *   - exponent: `1e3`, `1.5E-2`, `1.5e+2`
 *
 * Whitespace around the literal is tolerated. Anything else throws
 * {@link InvalidDecimalError}.
 */

import { InvalidDecimalError } from "./errors";

/** Internal representation of a decimal — exported for tests. */
export interface ParsedDecimal {
  /** Signed integer coefficient. */
  readonly coefficient: bigint;
  /** Signed base-10 exponent. */
  readonly exponent: number;
}

const LITERAL_PATTERN =
  /^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?$/;

/**
 * Parse *input* into a {@link ParsedDecimal}.
 *
 * @throws {InvalidDecimalError} if *input* does not match the grammar.
 */
export function parseDecimalString(input: string): ParsedDecimal {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new InvalidDecimalError(input, "empty string");
  }
  const match = LITERAL_PATTERN.exec(trimmed);
  if (match === null) {
    throw new InvalidDecimalError(input);
  }
  const [, sign, mantissa, exponent] = match;
  return buildParsedDecimal(sign, mantissa, exponent);
}

function buildParsedDecimal(
  sign: string,
  mantissa: string,
  exponent: string | undefined,
): ParsedDecimal {
  const dotPos = mantissa.indexOf(".");
  const digits = dotPos === -1 ? mantissa : mantissa.replace(".", "");
  const fracDigits = dotPos === -1 ? 0 : mantissa.length - dotPos - 1;
  const stripped = stripLeadingZeros(digits);
  const negative = sign === "-" && stripped !== "0";
  const magnitude = BigInt(stripped);
  const coefficient = negative ? -magnitude : magnitude;
  const expPart = exponent === undefined ? 0 : Number.parseInt(exponent, 10);
  return { coefficient, exponent: expPart - fracDigits };
}

function stripLeadingZeros(digits: string): string {
  let i = 0;
  while (i < digits.length - 1 && digits[i] === "0") i += 1;
  return digits.slice(i);
}

/**
 * Parse a JavaScript `number` into a {@link ParsedDecimal}.
 *
 * The number is first converted to a string via its canonical
 * representation; this means values that don't have an exact
 * decimal form (e.g. `0.1 + 0.2`) will inherit the noise of the
 * underlying IEEE-754 representation. Prefer passing a string
 * literal to {@link Decimal.from} when exactness matters.
 *
 * `NaN` and `±Infinity` are rejected.
 */
export function parseNumber(input: number): ParsedDecimal {
  if (!Number.isFinite(input)) {
    throw new InvalidDecimalError(input, "not a finite number");
  }
  return parseDecimalString(input.toString());
}

/** Wrap a `bigint` into the canonical exponent-0 form. */
export function parseBigInt(input: bigint): ParsedDecimal {
  return { coefficient: input, exponent: 0 };
}
