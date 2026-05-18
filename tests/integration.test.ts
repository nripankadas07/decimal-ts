import { Decimal } from "../src";

describe("realistic money-handling scenarios", () => {
  test("sum of penny amounts is exact", () => {
    let total = Decimal.from("0");
    for (let i = 0; i < 100; i += 1) total = total.add("0.01");
    expect(total.toFixed(2)).toBe("1.00");
  });

  test("apply VAT then split equally", () => {
    const net = Decimal.from("99.99");
    const vat = net.mul("0.20");
    const gross = net.add(vat);
    expect(gross.toFixed(2)).toBe("119.99");
    // Split across 3 parties, last bears the remainder.
    const share = gross.div(3, 2);
    expect(share.toString()).toBe("40.00");
    const remainder = gross.sub(share.mul(3));
    expect(remainder.toFixed(2)).toBe("-0.01");
  });

  test("compound interest over 10 years", () => {
    let balance = Decimal.from("1000");
    const rate = Decimal.from("1.05");
    for (let year = 0; year < 10; year += 1) balance = balance.mul(rate);
    // Exact value would have many decimals; round to 2.
    expect(balance.round(2, "HALF_EVEN").toFixed(2)).toBe("1628.89");
  });

  test("currency conversion with explicit rounding policy", () => {
    const usd = Decimal.from("123.45");
    const rate = Decimal.from("0.91");
    const eur = usd.mul(rate);
    expect(eur.toFixed(2, "HALF_UP")).toBe("112.34");
  });
});

describe("invariants and round-trips", () => {
  test("a + b == b + a (commutativity)", () => {
    const a = Decimal.from("1.234");
    const b = Decimal.from("0.5678");
    expect(a.add(b).eq(b.add(a))).toBe(true);
  });

  test("a * b == b * a (commutativity)", () => {
    const a = Decimal.from("1.234");
    const b = Decimal.from("0.5678");
    expect(a.mul(b).eq(b.mul(a))).toBe(true);
  });

  test("(a + b) - b == a (additive identity by negation)", () => {
    const a = Decimal.from("3.14159");
    const b = Decimal.from("2.71828");
    expect(a.add(b).sub(b).eq(a)).toBe(true);
  });

  test("a.neg().neg() == a", () => {
    const a = Decimal.from("-42.42");
    expect(a.neg().neg().eq(a)).toBe(true);
  });

  test("abs(neg(a)) == abs(a)", () => {
    const a = Decimal.from("-123.456");
    expect(a.neg().abs().eq(a.abs())).toBe(true);
  });

  test("normalize preserves equality across many representations", () => {
    const seeds = ["1", "1.0", "1.00", "1.000", "10e-1", "100e-2"];
    const norms = seeds.map((s) => Decimal.from(s).normalize().toString());
    expect(new Set(norms)).toEqual(new Set(["1"]));
  });

  test("Decimal.ZERO and Decimal.ONE are well-known constants", () => {
    expect(Decimal.ZERO.isZero()).toBe(true);
    expect(Decimal.ONE.eq("1")).toBe(true);
  });

  test("an immutable instance — operations don't mutate the receiver", () => {
    const original = Decimal.from("1.5");
    const coefBefore = original.coefficient;
    const expBefore = original.exponent;
    original.add("2.5");
    original.mul("10");
    original.div("3", 5);
    expect(original.coefficient).toBe(coefBefore);
    expect(original.exponent).toBe(expBefore);
  });
});
