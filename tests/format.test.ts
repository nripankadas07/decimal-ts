import { Decimal, InvalidScaleError, type RoundingMode } from "../src";

describe("toString / formatting", () => {
  test.each<[string, string]>([
    ["0", "0"],
    ["1", "1"],
    ["-1", "-1"],
    ["123", "123"],
    ["1.5", "1.5"],
    ["-1.5", "-1.5"],
    ["0.001", "0.001"],
    ["0.5", "0.5"],
    ["10", "10"],
    ["100", "100"],
    ["1e3", "1000"],
    ["1.5e2", "150"],
    ["1.5e-3", "0.0015"],
  ])("toString(%s) == %s", (input, expected) => {
    expect(Decimal.from(input).toString()).toBe(expected);
  });

  test("toString round-trips through Decimal.from", () => {
    const inputs = ["1.5", "-1.5", "0.001", "100", "1234.5678"];
    for (const input of inputs) {
      expect(Decimal.from(Decimal.from(input).toString()).eq(input)).toBe(true);
    }
  });

  test("toJSON matches toString", () => {
    const d = Decimal.from("3.14");
    expect(d.toJSON()).toBe("3.14");
    expect(JSON.stringify({ value: d })).toBe('{"value":"3.14"}');
  });
});

describe("toFixed", () => {
  test("pads with trailing zeros when needed", () => {
    expect(Decimal.from("1").toFixed(2)).toBe("1.00");
    expect(Decimal.from("0").toFixed(3)).toBe("0.000");
  });

  test("rounds when scale is too small", () => {
    expect(Decimal.from("1.236").toFixed(2)).toBe("1.24");
    expect(Decimal.from("1.234").toFixed(2)).toBe("1.23");
  });

  test("scale 0 produces no decimal point", () => {
    expect(Decimal.from("1.6").toFixed(0)).toBe("2");
    expect(Decimal.from("1.4").toFixed(0)).toBe("1");
  });

  test("toFixed uses HALF_EVEN by default", () => {
    expect(Decimal.from("0.5").toFixed(0)).toBe("0");
    expect(Decimal.from("1.5").toFixed(0)).toBe("2");
    expect(Decimal.from("2.5").toFixed(0)).toBe("2");
  });

  test("toFixed accepts custom rounding mode", () => {
    expect(Decimal.from("0.5").toFixed(0, "HALF_UP")).toBe("1");
    expect(Decimal.from("0.5").toFixed(0, "HALF_DOWN")).toBe("0");
  });

  test("toFixed rejects negative scale", () => {
    expect(() => Decimal.from("1").toFixed(-1)).toThrow(InvalidScaleError);
  });

  test("toFixed handles negative numbers", () => {
    expect(Decimal.from("-1.5").toFixed(2)).toBe("-1.50");
    expect(Decimal.from("-0.005").toFixed(2, "HALF_UP")).toBe("-0.01");
  });

  test("toFixed handles values smaller than the scale", () => {
    expect(Decimal.from("0.0001").toFixed(2)).toBe("0.00");
    expect(Decimal.from("0.005").toFixed(2, "HALF_UP")).toBe("0.01");
  });

  test("toFixed handles already-wider values without losing the prefix", () => {
    expect(Decimal.from("1000").toFixed(3)).toBe("1000.000");
  });

  test("toFixed default mode is HALF_EVEN when omitted", () => {
    const r1: string = Decimal.from("1.5").toFixed(0);
    const r2: string = Decimal.from("1.5").toFixed(
      0,
      "HALF_EVEN" as RoundingMode,
    );
    expect(r1).toBe(r2);
  });
});

describe("toNumber", () => {
  test("converts simple decimals to numbers", () => {
    expect(Decimal.from("1.5").toNumber()).toBe(1.5);
    expect(Decimal.from("-3.14").toNumber()).toBe(-3.14);
  });

  test("very large values overflow to Infinity", () => {
    const huge = Decimal.from("1e500");
    expect(huge.toNumber()).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("normalize", () => {
  test("strips trailing-zero precision", () => {
    const n = Decimal.from("1.500").normalize();
    expect(n.coefficient).toBe(15n);
    expect(n.exponent).toBe(-1);
  });

  test("normalize of zero returns canonical zero", () => {
    expect(Decimal.from("0").normalize().coefficient).toBe(0n);
    expect(Decimal.from("0.00").normalize().exponent).toBe(0);
  });

  test("normalize is idempotent", () => {
    const n = Decimal.from("123.4500").normalize();
    expect(n.normalize().coefficient).toBe(n.coefficient);
    expect(n.normalize().exponent).toBe(n.exponent);
  });

  test("normalize preserves numeric equality", () => {
    const d = Decimal.from("100.000");
    expect(d.normalize().eq(d)).toBe(true);
  });
});
