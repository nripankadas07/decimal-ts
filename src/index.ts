/**
 * decimal-ts — arbitrary-precision fixed-point decimal arithmetic.
 *
 * Public surface:
 *
 *   - {@link Decimal}                — the immutable value type.
 *   - {@link DecimalError}           — base of the error hierarchy.
 *   - {@link InvalidDecimalError}    — parse failures.
 *   - {@link DivisionByZeroError}    — divide by zero / mod by zero.
 *   - {@link InvalidScaleError}      — negative / non-integer scale.
 *   - {@link InvalidRoundingModeError} — unknown rounding mode.
 *   - {@link RoundingMode}           — string literal type.
 *   - {@link ROUNDING_MODES}         — runtime list of valid modes.
 */

export { Decimal } from "./decimal";
export {
  DecimalError,
  DivisionByZeroError,
  InvalidDecimalError,
  InvalidRoundingModeError,
  InvalidScaleError,
} from "./errors";
export { ROUNDING_MODES } from "./types";
export type { DecimalInput, RoundingMode } from "./types";
