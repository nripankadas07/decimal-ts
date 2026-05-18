import {
  Decimal,
  InvalidRoundingModeError,
  InvalidScaleError,
  type RoundingMode,
} from "../src";

describe("Decimal.round", () => {
  test("defaults to HALF_EVEN, integer rounding", () => {
    expect(Decimal.from("1.5").round().toString()).toBe("2");
    expect(Decimal.from("2.5").round().toString()).toBe("2");
    expect(Decimal.from("3.5").round().toString()).toBe("4");
  });

  test("round to N decimal places", () => {
    expect(Decimal.from("1.234567").round(3).toString()).toBe("1.235");
    expect(Decimal.from("1.234567").round(0).toString()).toBe("1");
  });

  test("DOWN truncates toward zero", () => {
    expect(Decimal.from("1.9").round(0, "DOWN").toString()).toBe("1");
    expect(Decimal.from("-1.9").round(0, "DOWN").toString()).toBe("-1");
  });

  test("UP always rounds away from zero", () => {
    expect(Decimal.from("1.1").round(0, "UP").toString()).toBe("2");
    expect(Decimal.from("-1.1").round(0, "UP").toString()).toBe("-2");
  });

  test("FLOOR toward -infinity", () => {
    expect(Decimal.from("1.9").round(0, "FLOOR").toString()).toBe("1");
    expect(Decimal.from("-1.1").round(0, "FLOOR").toString()).toBe("-2");
  });

  test("CEIL toward +infinity", () => {
    expect(Decimal.from("1.1").round(0, "CEIL").toString()).toBe("2");
    expect(Decimal.from("-1.9").round(0, "CEIL").toString()).toBe("-1");
  });

  test("HALF_UP rounds 0.5 away from zero", () => {
    expect(Decimal.from("0.5").round(0, "HALF_UP").toString()).toBe("1");
    expect(Decimal.from("-0.5").round(0, "HALF_UP").toString()).toBe("-1");
    expect(Decimal.from("1.5").round(0, "HALF_UP").toString()).toBe("2");
  });

  test("HALF_DOWN rounds 0.5 toward zero", () => {
    expect(Decimal.from("0.5").round(0, "HALF_DOWN").toString()).toBe("0");
    expect(Decimal.from("-0.5").round(0, "HALF_DOWN").toString()).toBe("0");
    expect(Decimal.from("1.5").round(0, "HALF_DOWN").toString()).toBe("1");
  });

  test("round is a no-op when already at target scale or coarser", () => {
    const d = Decimal.from("100");
    expect(d.round(5)).toBe(d);
  });

  test("round rejects negative scale", () => {
    expect(() => Decimal.from("1").round(-1)).toThrow(InvalidScaleError);
  });

  test("round rejects non-integer scale", () => {
    expect(() => Decimal.from("1").round(1.5)).toThrow(InvalidScaleError);
  });

  test("round rejects unknown mode", () => {
    expect(() =>
      Decimal.from("1.5").round(0, "BANANA" as unknown as RoundingMode),
    ).toThrow(InvalidRoundingModeError);
  });

  test("InvalidRoundingModeError carries received value", () => {
    try {
      Decimal.from("1.5").round(0, "BAD" as unknown as RoundingMode);
    } catch (exc) {
      expect((exc as InvalidRoundingModeError).received).toBe("BAD");
    }
  });
});

describe("Decimal.truncate / floor / ceil", () => {
  test("truncate is round(scale, DOWN)", () => {
    expect(Decimal.from("1.999").truncate().toString()).toBe("1");
    expect(Decimal.from("-1.999").truncate().toString()).toBe("-1");
  });

  test("truncate keeps decimal places when requested", () => {
    expect(Decimal.from("1.9876").truncate(2).toString()).toBe("1.98");
  });

  test("floor", () => {
    expect(Decimal.from("1.1").floor().toString()).toBe("1");
    expect(Decimal.from("-1.1").floor().toString()).toBe("-2");
  });

  test("ceil", () => {
    expect(Decimal.from("1.1").ceil().toString()).toBe("2");
    expect(Decimal.from("-1.1").ceil().toString()).toBe("-1");
  });

  test("floor / ceil on integers are no-ops", () => {
    const d = Decimal.from("5");
    expect(d.floor()).toBe(d);
    expect(d.ceil()).toBe(d);
  });
});

describe("HALF_EVEN tie-break tests (banker's rounding)", () => {
  test.each<[string, string]>([
    ["0.5", "0"],
    ["1.5", "2"],
    ["2.5", "2"],
    ["3.5", "4"],
    ["4.5", "4"],
    ["5.5", "6"],
    ["-0.5", "0"],
    ["-1.5", "-2"],
    ["-2.5", "-2"],
    ["-3.5", "-4"],
  ])("HALF_EVEN(%s) == %s", (input, expected) => {
    expect(Decimal.from(input).round(0, "HALF_EVEN").toString()).toBe(expected);
  });
});

describe("Decimal.rescale", () => {
  test("rescale to finer exponent shifts coefficient", () => {
    const d = Decimal.from("1.5");
    const rescaled = d.rescale(-3);
    expect(rescaled.coefficient).toBe(1500n);
    expect(rescaled.exponent).toBe(-3);
  });

  test("rescale to coarser exponent rounds", () => {
    const d = Decimal.from("1.555");
    expect(d.rescale(-2, "HALF_UP").toString()).toBe("1.56");
  });

  test("rescale rejects non-integer exponent", () => {
    expect(() => Decimal.from("1").rescale(0.5)).toThrow();
  });
});
