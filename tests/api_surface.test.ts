import {
  Decimal,
  DecimalError,
  DivisionByZeroError,
  InvalidDecimalError,
  InvalidRoundingModeError,
  InvalidScaleError,
  ROUNDING_MODES,
} from "../src";

describe("public API surface", () => {
  test("exports Decimal class with static constants", () => {
    expect(typeof Decimal).toBe("function");
    expect(Decimal.ZERO).toBeInstanceOf(Decimal);
    expect(Decimal.ONE).toBeInstanceOf(Decimal);
  });

  test("exports the full error hierarchy", () => {
    for (const cls of [
      InvalidDecimalError,
      DivisionByZeroError,
      InvalidScaleError,
      InvalidRoundingModeError,
    ]) {
      expect(cls.prototype).toBeInstanceOf(DecimalError);
    }
  });

  test("ROUNDING_MODES contains exactly the seven supported modes", () => {
    expect(new Set(ROUNDING_MODES)).toEqual(
      new Set([
        "DOWN",
        "UP",
        "FLOOR",
        "CEIL",
        "HALF_UP",
        "HALF_DOWN",
        "HALF_EVEN",
      ]),
    );
    expect(ROUNDING_MODES).toHaveLength(7);
  });

  test("Decimal instances are immutable (frozen)", () => {
    const d = Decimal.from("1.5");
    expect(Object.isFrozen(d)).toBe(true);
  });

  test("InvalidDecimalError formats string, bigint, and other inputs", () => {
    expect(new InvalidDecimalError("oops").message).toContain('"oops"');
    expect(new InvalidDecimalError(42n).message).toContain("42n");
    expect(new InvalidDecimalError(3.14).message).toContain("3.14");
  });

  test("DecimalError instances preserve their class name for diagnostics", () => {
    expect(new InvalidDecimalError("x").name).toBe("InvalidDecimalError");
    expect(new DivisionByZeroError().name).toBe("DivisionByZeroError");
    expect(new InvalidScaleError(-1).name).toBe("InvalidScaleError");
    expect(new InvalidRoundingModeError("X").name).toBe(
      "InvalidRoundingModeError",
    );
  });
});
