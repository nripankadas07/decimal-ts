/**
 * The `Decimal` class — public surface of the `decimal-ts` package.
 *
 * A `Decimal` is an immutable fixed-point number stored as the pair
 * `(coefficient, exponent)`, meaning `coefficient × 10^exponent`.
 * Every arithmetic operation returns a new instance; the original
 * is never mutated.
 */

import {
  addPairs,
  assertScale,
  comparePairs,
  divPairs,
  modPairs,
  mulPairs,
  pow10,
  shiftLeft,
  subPairs,
} from "./arithmetic";
import { InvalidDecimalError } from "./errors";
import { formatDecimal, formatFixed } from "./format";
import { parseBigInt, parseDecimalString, parseNumber } from "./parse";
import { roundedDivide } from "./rounding";
import type { DecimalInput, RoundingMode } from "./types";

const DEFAULT_DIV_SCALE = 20;
const DEFAULT_DIV_MODE: RoundingMode = "HALF_EVEN";
const DEFAULT_ROUND_MODE: RoundingMode = "HALF_EVEN";

export class Decimal {
  /** The integer coefficient. */
  readonly coefficient: bigint;
  /** The base-10 exponent. */
  readonly exponent: number;

  /** @internal — use {@link Decimal.from} or {@link Decimal.fromParts}. */
  private constructor(coefficient: bigint, exponent: number) {
    this.coefficient = coefficient === 0n ? 0n : coefficient;
    this.exponent = coefficient === 0n ? 0 : exponent;
    Object.freeze(this);
  }

  // -- construction -------------------------------------------------

  static from(value: DecimalInput): Decimal {
    if (value instanceof Decimal) {
      return value;
    }
    if (typeof value === "string") {
      const { coefficient, exponent } = parseDecimalString(value);
      return new Decimal(coefficient, exponent);
    }
    if (typeof value === "number") {
      const { coefficient, exponent } = parseNumber(value);
      return new Decimal(coefficient, exponent);
    }
    if (typeof value === "bigint") {
      const { coefficient, exponent } = parseBigInt(value);
      return new Decimal(coefficient, exponent);
    }
    return Decimal.fromParts(value);
  }

  /** Build a {@link Decimal} from explicit coefficient/exponent. */
  static fromParts(parts: {
    readonly coefficient: bigint;
    readonly exponent: number;
  }): Decimal {
    Decimal.validateParts(parts);
    return new Decimal(parts.coefficient, parts.exponent);
  }

  private static validateParts(parts: {
    readonly coefficient: bigint;
    readonly exponent: number;
  }): void {
    if (typeof parts.coefficient !== "bigint") {
      throw new InvalidDecimalError(parts, "coefficient must be bigint");
    }
    if (!Number.isInteger(parts.exponent)) {
      throw new InvalidDecimalError(parts, "exponent must be an integer");
    }
  }

  /** A {@link Decimal} representing zero. */
  static readonly ZERO: Decimal = new Decimal(0n, 0);

  /** A {@link Decimal} representing one. */
  static readonly ONE: Decimal = new Decimal(1n, 0);

  // -- arithmetic ---------------------------------------------------

  add(other: DecimalInput): Decimal {
    const rhs = Decimal.from(other);
    const result = addPairs(this, rhs);
    return new Decimal(result.coefficient, result.exponent);
  }

  sub(other: DecimalInput): Decimal {
    const rhs = Decimal.from(other);
    const result = subPairs(this, rhs);
    return new Decimal(result.coefficient, result.exponent);
  }

  mul(other: DecimalInput): Decimal {
    const rhs = Decimal.from(other);
    const result = mulPairs(this, rhs);
    return new Decimal(result.coefficient, result.exponent);
  }

  div(
    other: DecimalInput,
    scale: number = DEFAULT_DIV_SCALE,
    mode: RoundingMode = DEFAULT_DIV_MODE,
  ): Decimal {
    const rhs = Decimal.from(other);
    const result = divPairs(this, rhs, scale, mode);
    return new Decimal(result.coefficient, result.exponent);
  }

  mod(other: DecimalInput): Decimal {
    const rhs = Decimal.from(other);
    const result = modPairs(this, rhs);
    return new Decimal(result.coefficient, result.exponent);
  }

  neg(): Decimal {
    return new Decimal(-this.coefficient, this.exponent);
  }

  abs(): Decimal {
    return this.coefficient < 0n
      ? new Decimal(-this.coefficient, this.exponent)
      : this;
  }

  // -- rounding -----------------------------------------------------

  round(scale: number = 0, mode: RoundingMode = DEFAULT_ROUND_MODE): Decimal {
    assertScale(scale);
    const targetExp = -scale;
    if (this.exponent >= targetExp) return this;
    const shift = targetExp - this.exponent;
    const coefficient = roundedDivide(this.coefficient, pow10(shift), mode);
    return new Decimal(coefficient, targetExp);
  }

  truncate(scale: number = 0): Decimal {
    return this.round(scale, "DOWN");
  }

  floor(scale: number = 0): Decimal {
    return this.round(scale, "FLOOR");
  }

  ceil(scale: number = 0): Decimal {
    return this.round(scale, "CEIL");
  }

  // -- comparison ---------------------------------------------------

  compare(other: DecimalInput): number {
    return comparePairs(this, Decimal.from(other));
  }

  eq(other: DecimalInput): boolean { return this.compare(other) === 0; }
  lt(other: DecimalInput): boolean { return this.compare(other) < 0; }
  lte(other: DecimalInput): boolean { return this.compare(other) <= 0; }
  gt(other: DecimalInput): boolean { return this.compare(other) > 0; }
  gte(other: DecimalInput): boolean { return this.compare(other) >= 0; }

  // -- inspection ---------------------------------------------------

  signum(): -1 | 0 | 1 {
    if (this.coefficient < 0n) return -1;
    if (this.coefficient > 0n) return 1;
    return 0;
  }

  isZero(): boolean { return this.coefficient === 0n; }
  isPositive(): boolean { return this.coefficient > 0n; }
  isNegative(): boolean { return this.coefficient < 0n; }

  isInteger(): boolean {
    if (this.exponent >= 0) return true;
    const divisor = pow10(-this.exponent);
    return this.coefficient % divisor === 0n;
  }

  /**
   * Return an equivalent {@link Decimal} with trailing-zero digits in
   * the coefficient stripped (i.e. the smallest exponent that still
   * represents the same numeric value).
   */
  normalize(): Decimal {
    if (this.coefficient === 0n) return Decimal.ZERO;
    let coef = this.coefficient;
    let exp = this.exponent;
    while (coef % 10n === 0n) {
      coef = coef / 10n;
      exp += 1;
    }
    return new Decimal(coef, exp);
  }

  // -- formatting ---------------------------------------------------

  toString(): string { return formatDecimal(this.coefficient, this.exponent); }
  toJSON(): string { return this.toString(); }

  toFixed(scale: number, mode: RoundingMode = DEFAULT_ROUND_MODE): string {
    assertScale(scale);
    const rounded = this.round(scale, mode);
    return formatFixed(rounded.coefficient, rounded.exponent, scale);
  }

  /**
   * Lossy conversion to a JavaScript `number`. Precision is bounded
   * by IEEE-754 double; values whose magnitude exceeds
   * `Number.MAX_VALUE` collapse to `±Infinity`.
   */
  toNumber(): number { return Number(this.toString()); }

  /** Force re-scaling to an explicit exponent. */
  rescale(exponent: number, mode: RoundingMode = DEFAULT_ROUND_MODE): Decimal {
    if (!Number.isInteger(exponent)) {
      throw new InvalidDecimalError(exponent, "exponent must be an integer");
    }
    if (exponent <= this.exponent) {
      const shift = this.exponent - exponent;
      return new Decimal(shiftLeft(this.coefficient, shift), exponent);
    }
    const shift = exponent - this.exponent;
    const coefficient = roundedDivide(this.coefficient, pow10(shift), mode);
    return new Decimal(coefficient, exponent);
  }
}
