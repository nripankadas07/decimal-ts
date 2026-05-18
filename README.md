# decimal-ts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: 18+](https://img.shields.io/badge/Node-18%2B-339933.svg)](https://nodejs.org/)
[![TypeScript: strict](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests: 174](https://img.shields.io/badge/Tests-174%20passing-brightgreen.svg)](#running-tests)
[![Coverage: 100%](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](#running-tests)

Arbitrary-precision **fixed-point** decimal arithmetic for
TypeScript / JavaScript. Values are stored as a `BigInt`
coefficient plus a signed exponent, so every operation is exact
unless you explicitly round.

- **Exact arithmetic** — `0.1 + 0.2 === 0.3` (really).
- **Seven rounding modes** — `DOWN`, `UP`, `FLOOR`, `CEIL`,
  `HALF_UP`, `HALF_DOWN`, `HALF_EVEN` (banker's).
- **No floating-point in the hot path** — everything reduces to
  `BigInt` arithmetic.
- **Immutable** — every operation returns a fresh `Decimal`; the
  receiver is `Object.freeze`d.
- **Zero runtime dependencies, fully typed, strict TS config.**

## Install

```bash
npm install decimal-ts
```

Node 18+ is required (uses `BigInt`).

## Usage

```ts
import { Decimal } from "decimal-ts";

const a = Decimal.from("0.1");
const b = Decimal.from("0.2");
a.add(b).toString();              // "0.3"
a.add(b).eq("0.3");               // true

// Multiply currency by a tax rate.
const net   = Decimal.from("99.99");
const total = net.mul("1.20");
total.toFixed(2);                 // "119.99"

// Non-terminating division — you must pick a scale + mode.
Decimal.from(1).div(3, 6).toString();              // "0.333333"
Decimal.from(2).div(3, 6, "HALF_UP").toString();   // "0.666667"

// Banker's rounding for statistical aggregates.
Decimal.from("2.5").round(0, "HALF_EVEN").toString();  // "2"
Decimal.from("3.5").round(0, "HALF_EVEN").toString();  // "4"

// Compare values regardless of textual representation.
Decimal.from("1.0").eq("1.00");   // true
Decimal.from("100").eq("1e2");    // true
```

## API

### `Decimal`

Construction:

| | |
|---|---|
| `Decimal.from(value)` | Build from `string`, `number`, `bigint`, `Decimal`, or `{coefficient, exponent}`. |
| `Decimal.fromParts({coefficient, exponent})` | Strict factory for the structural form. |
| `Decimal.ZERO`, `Decimal.ONE` | Singleton constants. |

Arithmetic (return new `Decimal`):

| Method | Description |
|--------|-------------|
| `add(other)` | Exact sum. |
| `sub(other)` | Exact difference. |
| `mul(other)` | Exact product. |
| `div(other, scale=20, mode='HALF_EVEN')` | Rounded quotient. Throws `DivisionByZeroError` if `other === 0`. |
| `mod(other)` | Truncated remainder; sign matches dividend. |
| `neg()`, `abs()` | Sign manipulation. |

Rounding:

| Method | Description |
|--------|-------------|
| `round(scale=0, mode='HALF_EVEN')` | Round to `scale` decimal places. |
| `truncate(scale=0)` | Alias for `round(scale, 'DOWN')`. |
| `floor(scale=0)` | Alias for `round(scale, 'FLOOR')`. |
| `ceil(scale=0)` | Alias for `round(scale, 'CEIL')`. |
| `rescale(exp, mode='HALF_EVEN')` | Force a specific exponent. |

Comparison:

| Method | Description |
|--------|-------------|
| `compare(other)` | Returns `-1` / `0` / `1`. |
| `eq` / `lt` / `lte` / `gt` / `gte` | Boolean checks. Values with different scales (e.g. `1.0` vs `1.00`) compare equal when numerically equal. |

Inspection:

| Method | Description |
|--------|-------------|
| `signum()` | Returns `-1`, `0`, or `1`. |
| `isZero()`, `isPositive()`, `isNegative()` | Sign predicates (zero is neither positive nor negative). |
| `isInteger()` | True when the value is an integer. |
| `normalize()` | Return a new `Decimal` with trailing-zero digits stripped. |

Formatting:

| Method | Description |
|--------|-------------|
| `toString()` | Plain decimal notation (no scientific). |
| `toFixed(scale, mode='HALF_EVEN')` | String with exactly `scale` fractional digits. |
| `toJSON()` | Same as `toString()` — `JSON.stringify` produces a string. |
| `toNumber()` | Lossy conversion to `number`; overflows to `±Infinity`. |

### Rounding modes

```ts
type RoundingMode =
  | 'DOWN'       // toward zero
  | 'UP'         // away from zero
  | 'FLOOR'      // toward -∞
  | 'CEIL'       // toward +∞
  | 'HALF_UP'    // nearest, ties away from zero
  | 'HALF_DOWN'  // nearest, ties toward zero
  | 'HALF_EVEN'; // nearest, ties to even (banker's)
```

`ROUNDING_MODES` is a frozen `readonly` array of the seven values.

### Errors

```
DecimalError                      (base)
├── InvalidDecimalError           (parse failure; .received)
├── DivisionByZeroError           (div / mod by zero)
├── InvalidScaleError             (negative or non-integer scale; .received)
└── InvalidRoundingModeError      (unknown mode string; .received)
```

All errors extend the native `Error`, so `instanceof Error` is true
for every one.

## Why `BigInt` instead of a high-precision float library?

A `BigInt` coefficient gives us *exact* representation of every
finite decimal value at arbitrary precision; the only place
rounding enters is `div` and the explicit rounding helpers. That
matches how Java's `BigDecimal` and Python's `decimal` work, and
it's the right model for money, tax, settlement, and any other
domain where a single off-by-one cent is unacceptable.

## Running Tests

```bash
npm install
npx tsc --noEmit            # strict typecheck — 0 errors
npx jest                    # 174 tests, all green
npx jest --coverage         # 100% statements / branches / functions / lines
```

## License

MIT
