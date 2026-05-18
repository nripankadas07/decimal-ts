/**
 * Error hierarchy for `decimal-ts`.
 *
 * All errors inherit from {@link DecimalError}, which extends the
 * native `Error`. Callers can either catch the broad family or
 * discriminate on a specific subclass via `instanceof`.
 */

/** Base class for every `decimal-ts` failure. */
export class DecimalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecimalError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when a string cannot be parsed as a decimal literal. */
export class InvalidDecimalError extends DecimalError {
  /** The original input that failed to parse. */
  readonly received: unknown;

  constructor(received: unknown, detail?: string) {
    const tail = detail === undefined ? "" : `: ${detail}`;
    super(`invalid decimal value ${describe(received)}${tail}`);
    this.name = "InvalidDecimalError";
    this.received = received;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised by {@link Decimal.div} / {@link Decimal.mod} when divisor is zero. */
export class DivisionByZeroError extends DecimalError {
  constructor() {
    super("division by zero");
    this.name = "DivisionByZeroError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when a non-integer or negative scale is passed where one is required. */
export class InvalidScaleError extends DecimalError {
  /** The scale value that was rejected. */
  readonly received: number;

  constructor(received: number) {
    super(`scale must be a non-negative integer, got ${received}`);
    this.name = "InvalidScaleError";
    this.received = received;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when an unknown rounding-mode string is passed. */
export class InvalidRoundingModeError extends DecimalError {
  /** The mode string that was rejected. */
  readonly received: unknown;

  constructor(received: unknown) {
    super(`unknown rounding mode ${describe(received)}`);
    this.name = "InvalidRoundingModeError";
    this.received = received;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function describe(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "bigint") return `${value}n`;
  return String(value);
}
