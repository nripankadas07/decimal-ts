import { Decimal, InvalidDecimalError } from "../src";

describe("Decimal.from — parsing", () => {
  test.each<[string, bigint, number]>([
    ["0", 0n, 0],
    ["1", 1n, 0],
    ["-1", -1n, 0],
    ["+0", 0n, 0],
    ["-0", 0n, 0],
    ["123", 123n, 0],
    ["1.5", 15n, -1],
    ["-1.5", -15n, -1],
    ["0.001", 1n, -3],
    [".5", 5n, -1],
    ["5.", 5n, 0],
    ["007", 7n, 0],
    ["1e3", 1n, 3],
    ["1.5e2", 15n, 1],
    ["1.5E-2", 15n, -3],
    ["1.5e+2", 15n, 1],
    ["100", 100n, 0],
    ["10.00", 1000n, -2],
  ])("parses %s correctly", (input, coef, exp) => {
    const d = Decimal.from(input);
    expect(d.coefficient).toBe(coef);
    expect(d.exponent).toBe(exp);
  });

  test("tolerates surrounding whitespace", () => {
    const d = Decimal.from("   42  ");
    expect(d.coefficient).toBe(42n);
    expect(d.exponent).toBe(0);
  });

  test.each<string>(
    ["", "  ", "abc", "1.2.3", "--1", "1e", "1e+", "1ex", "1.e", ".", "1..2"],
  )("rejects %j as invalid", (bad) => {
    expect(() => Decimal.from(bad)).toThrow(InvalidDecimalError);
  });

  test("InvalidDecimalError carries the offending input", () => {
    try {
      Decimal.from("bad!!");
    } catch (exc) {
      expect(exc).toBeInstanceOf(InvalidDecimalError);
      expect((exc as InvalidDecimalError).received).toBe("bad!!");
    }
  });

  test("Decimal.from(number) round-trips finite values", () => {
    expect(Decimal.from(0).toString()).toBe("0");
    expect(Decimal.from(1).toString()).toBe("1");
    expect(Decimal.from(-12.5).toString()).toBe("-12.5");
    expect(Decimal.from(1.5e2).toString()).toBe("150");
  });

  test("Decimal.from(number) rejects non-finite values", () => {
    expect(() => Decimal.from(Number.NaN)).toThrow(InvalidDecimalError);
    expect(() => Decimal.from(Number.POSITIVE_INFINITY)).toThrow(
      InvalidDecimalError,
    );
    expect(() => Decimal.from(Number.NEGATIVE_INFINITY)).toThrow(
      InvalidDecimalError,
    );
  });

  test("Decimal.from(bigint) preserves the integer exactly", () => {
    const big = 12345678901234567890n;
    const d = Decimal.from(big);
    expect(d.coefficient).toBe(big);
    expect(d.exponent).toBe(0);
  });

  test("Decimal.from(Decimal) returns the same instance", () => {
    const original = Decimal.from("3.14");
    expect(Decimal.from(original)).toBe(original);
  });

  test("Decimal.from rejects non-string non-number objects without coefficient", () => {
    expect(() => Decimal.from({} as never)).toThrow(InvalidDecimalError);
  });

  test("Decimal.from accepts {coefficient, exponent} via fromParts path", () => {
    const d = Decimal.from({ coefficient: 250n, exponent: -1 });
    expect(d.toString()).toBe("25.0");
    expect(d.eq("25")).toBe(true);
  });

  test("Decimal.fromParts rejects non-bigint coefficient", () => {
    expect(() =>
      Decimal.fromParts({ coefficient: 1 as never, exponent: 0 }),
    ).toThrow(InvalidDecimalError);
  });

  test("Decimal.fromParts rejects non-integer exponent", () => {
    expect(() =>
      Decimal.fromParts({ coefficient: 1n, exponent: 0.5 }),
    ).toThrow(InvalidDecimalError);
  });

  test("zero with non-zero exponent normalizes to canonical zero", () => {
    const d = Decimal.fromParts({ coefficient: 0n, exponent: -5 });
    expect(d.coefficient).toBe(0n);
    expect(d.exponent).toBe(0);
  });

  test("parsing -0 yields canonical zero (no sign)", () => {
    const d = Decimal.from("-0");
    expect(d.coefficient).toBe(0n);
    expect(d.toString()).toBe("0");
  });
});
