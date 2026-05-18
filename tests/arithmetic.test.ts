import { Decimal, DivisionByZeroError, InvalidScaleError } from "../src";

describe("addition / subtraction", () => {
  test("integer addition", () => {
    expect(Decimal.from("1").add("2").toString()).toBe("3");
  });

  test("decimal addition with same scale", () => {
    expect(Decimal.from("1.5").add("2.5").toString()).toBe("4.0");
  });

  test("decimal addition with different scales aligns", () => {
    expect(Decimal.from("1.5").add("0.001").toString()).toBe("1.501");
  });

  test("addition with negatives", () => {
    expect(Decimal.from("1.5").add("-2.5").toString()).toBe("-1.0");
  });

  test("addition preserves exact representation", () => {
    // 0.1 + 0.2 is the classic floating-point trap.
    expect(Decimal.from("0.1").add("0.2").toString()).toBe("0.3");
  });

  test("subtraction is add(neg)", () => {
    const a = Decimal.from("10.5");
    const b = Decimal.from("3.25");
    expect(a.sub(b).toString()).toBe("7.25");
  });

  test("subtraction yields zero when equal", () => {
    expect(Decimal.from("1.5").sub("1.5").coefficient).toBe(0n);
  });

  test("addition with scientific input", () => {
    expect(Decimal.from("1e3").add("500").toString()).toBe("1500");
  });
});

describe("multiplication", () => {
  test("multiplies coefficients and adds exponents", () => {
    expect(Decimal.from("1.5").mul("2").toString()).toBe("3.0");
  });

  test("scales accumulate", () => {
    expect(Decimal.from("0.1").mul("0.2").toString()).toBe("0.02");
  });

  test("multiplication by zero", () => {
    expect(Decimal.from("123.456").mul("0").isZero()).toBe(true);
  });

  test("multiplication preserves sign", () => {
    expect(Decimal.from("-2").mul("3").toString()).toBe("-6");
    expect(Decimal.from("-2").mul("-3").toString()).toBe("6");
  });

  test("large multiplication exact", () => {
    const big = Decimal.from("123456789012345678901234567890");
    const result = big.mul(big);
    expect(result.toString()).toBe(
      "15241578753238836750495351562536198787501905199875019052100",
    );
  });
});

describe("division", () => {
  test("exact division terminates regardless of scale", () => {
    expect(Decimal.from("10").div("4").toString()).toBe("2.50000000000000000000");
  });

  test("non-terminating division is rounded to default scale", () => {
    const result = Decimal.from("1").div("3");
    expect(result.toFixed(5)).toBe("0.33333");
  });

  test("division by zero throws", () => {
    expect(() => Decimal.from("1").div("0")).toThrow(DivisionByZeroError);
  });

  test("division with explicit scale + mode", () => {
    expect(Decimal.from("1").div("3", 4, "HALF_UP").toString()).toBe("0.3333");
    expect(Decimal.from("2").div("3", 4, "HALF_UP").toString()).toBe("0.6667");
  });

  test("DOWN rounding always truncates toward zero", () => {
    expect(Decimal.from("2").div("3", 2, "DOWN").toString()).toBe("0.66");
    expect(Decimal.from("-2").div("3", 2, "DOWN").toString()).toBe("-0.66");
  });

  test("UP rounding always rounds away from zero", () => {
    expect(Decimal.from("2").div("3", 2, "UP").toString()).toBe("0.67");
    expect(Decimal.from("-2").div("3", 2, "UP").toString()).toBe("-0.67");
  });

  test("FLOOR rounds toward -infinity", () => {
    expect(Decimal.from("-2").div("3", 2, "FLOOR").toString()).toBe("-0.67");
    expect(Decimal.from("2").div("3", 2, "FLOOR").toString()).toBe("0.66");
  });

  test("CEIL rounds toward +infinity", () => {
    expect(Decimal.from("2").div("3", 2, "CEIL").toString()).toBe("0.67");
    expect(Decimal.from("-2").div("3", 2, "CEIL").toString()).toBe("-0.66");
  });

  test("HALF_EVEN behaves like banker's rounding on ties", () => {
    expect(Decimal.from("5").div("2", 0, "HALF_EVEN").toString()).toBe("2");
    expect(Decimal.from("7").div("2", 0, "HALF_EVEN").toString()).toBe("4");
    expect(Decimal.from("-5").div("2", 0, "HALF_EVEN").toString()).toBe("-2");
  });

  test("HALF_UP rounds ties away from zero", () => {
    expect(Decimal.from("5").div("2", 0, "HALF_UP").toString()).toBe("3");
    expect(Decimal.from("-5").div("2", 0, "HALF_UP").toString()).toBe("-3");
  });

  test("HALF_DOWN rounds ties toward zero", () => {
    expect(Decimal.from("5").div("2", 0, "HALF_DOWN").toString()).toBe("2");
    expect(Decimal.from("-5").div("2", 0, "HALF_DOWN").toString()).toBe("-2");
  });

  test("division rejects negative scale", () => {
    expect(() => Decimal.from("1").div("3", -1)).toThrow(InvalidScaleError);
  });

  test("division rejects non-integer scale", () => {
    expect(() => Decimal.from("1").div("3", 1.5)).toThrow(InvalidScaleError);
  });

  test("InvalidScaleError carries the offending value", () => {
    try {
      Decimal.from("1").div("3", -2);
    } catch (exc) {
      expect((exc as InvalidScaleError).received).toBe(-2);
    }
  });

  test("division by negative number", () => {
    expect(Decimal.from("10").div("-2", 0).toString()).toBe("-5");
  });

  test("division of negatives by negatives", () => {
    expect(Decimal.from("-10").div("-2", 0).toString()).toBe("5");
  });

  test("dividing zero by anything returns zero", () => {
    expect(Decimal.from("0").div("7", 5).isZero()).toBe(true);
  });

  test("default rounding mode is HALF_EVEN", () => {
    // 1/2 rounded to 0 decimals with HALF_EVEN = 0 (round half to even)
    expect(Decimal.from("1").div("2", 0).toString()).toBe("0");
  });

  test("staged-division shift < 0 branch", () => {
    // a.exp=0, b.exp=5, scale=1 → shift = 0-5-(-1) = -4 (negative branch).
    // Result rounds to canonical zero.
    expect(Decimal.from("1").div("1e5", 1).isZero()).toBe(true);
  });

  test("staged-division shift < 0 branch with rounded-up result", () => {
    // 5 / 1e5, scale=4 → 0.00005 rounded HALF_UP to 4 dp = 0.0001
    expect(Decimal.from("5").div("1e5", 4, "HALF_UP").toString()).toBe("0.0001");
  });
});

describe("modulo", () => {
  test("integer mod", () => {
    expect(Decimal.from("10").mod("3").toString()).toBe("1");
  });

  test("decimal mod", () => {
    expect(Decimal.from("10.5").mod("3").toString()).toBe("1.5");
  });

  test("mod preserves sign of dividend", () => {
    expect(Decimal.from("-10").mod("3").toString()).toBe("-1");
    expect(Decimal.from("10").mod("-3").toString()).toBe("1");
    expect(Decimal.from("-10").mod("-3").toString()).toBe("-1");
  });

  test("mod of equal magnitudes is zero", () => {
    expect(Decimal.from("7").mod("7").isZero()).toBe(true);
  });

  test("mod by zero throws", () => {
    expect(() => Decimal.from("5").mod("0")).toThrow(DivisionByZeroError);
  });
});

describe("neg / abs / signum", () => {
  test("neg flips sign", () => {
    expect(Decimal.from("3.14").neg().toString()).toBe("-3.14");
    expect(Decimal.from("-3.14").neg().toString()).toBe("3.14");
  });

  test("neg of zero is zero", () => {
    expect(Decimal.from("0").neg().toString()).toBe("0");
  });

  test("abs strips sign", () => {
    expect(Decimal.from("-3.14").abs().toString()).toBe("3.14");
    expect(Decimal.from("3.14").abs().toString()).toBe("3.14");
  });

  test("abs of positive returns same instance", () => {
    const d = Decimal.from("3.14");
    expect(d.abs()).toBe(d);
  });

  test("signum returns -1/0/1", () => {
    expect(Decimal.from("-7").signum()).toBe(-1);
    expect(Decimal.from("0").signum()).toBe(0);
    expect(Decimal.from("7").signum()).toBe(1);
  });
});
