import { Decimal } from "../src";

describe("comparison operators", () => {
  test("compare returns -1 / 0 / 1", () => {
    expect(Decimal.from("1").compare("2")).toBe(-1);
    expect(Decimal.from("2").compare("2")).toBe(0);
    expect(Decimal.from("3").compare("2")).toBe(1);
  });

  test("compare across different scales", () => {
    expect(Decimal.from("1.0").compare("1.00")).toBe(0);
    expect(Decimal.from("1.5").compare("1.50")).toBe(0);
    expect(Decimal.from("1.5").compare("1.51")).toBe(-1);
  });

  test("compare across exponent ranges", () => {
    expect(Decimal.from("100").compare("1e2")).toBe(0);
    expect(Decimal.from("100").compare("1e3")).toBe(-1);
  });

  test("eq considers value, not representation", () => {
    expect(Decimal.from("1.0").eq("1")).toBe(true);
    expect(Decimal.from("100").eq("1e2")).toBe(true);
    expect(Decimal.from("0").eq("0.00")).toBe(true);
  });

  test("lt / lte / gt / gte cover boundary equality", () => {
    const a = Decimal.from("5");
    expect(a.lt(5)).toBe(false);
    expect(a.lte(5)).toBe(true);
    expect(a.gt(5)).toBe(false);
    expect(a.gte(5)).toBe(true);

    expect(a.lt(6)).toBe(true);
    expect(a.gt(4)).toBe(true);
  });

  test("comparison with negatives", () => {
    expect(Decimal.from("-1").lt(0)).toBe(true);
    expect(Decimal.from("-1").gt(-2)).toBe(true);
    expect(Decimal.from("-1").eq("-1.000")).toBe(true);
  });

  test("comparison accepts any DecimalInput", () => {
    expect(Decimal.from("3").eq(3n)).toBe(true);
    expect(Decimal.from("3").eq(3)).toBe(true);
  });
});

describe("isZero / isPositive / isNegative / isInteger", () => {
  test("isZero detects canonical zero", () => {
    expect(Decimal.from("0").isZero()).toBe(true);
    expect(Decimal.from("0.0000").isZero()).toBe(true);
    expect(Decimal.from("0.001").isZero()).toBe(false);
  });

  test("isPositive / isNegative don't include zero", () => {
    expect(Decimal.from("0").isPositive()).toBe(false);
    expect(Decimal.from("0").isNegative()).toBe(false);
    expect(Decimal.from("1").isPositive()).toBe(true);
    expect(Decimal.from("-1").isNegative()).toBe(true);
  });

  test("isInteger detects integral values", () => {
    expect(Decimal.from("0").isInteger()).toBe(true);
    expect(Decimal.from("42").isInteger()).toBe(true);
    expect(Decimal.from("1e3").isInteger()).toBe(true);
    expect(Decimal.from("1.5").isInteger()).toBe(false);
    // 100.00 stores as 10000e-2 but value is integral
    expect(Decimal.from("100.00").isInteger()).toBe(true);
    // 1.0 is integral after stripping trailing zero
    expect(Decimal.from("1.0").isInteger()).toBe(true);
  });
});
