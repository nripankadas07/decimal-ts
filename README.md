# decimal-ts

Exact decimal arithmetic for money-style calculations in TypeScript.

**Thesis:** JavaScript numbers are the wrong abstraction for cents, taxes, and
settlement. `decimal-ts` stores finite decimals as `BigInt` coefficient plus a
base-10 exponent.

## Run It In 30 Seconds

```bash
npm install && npm run demo
```

## Why Care?

```ts
0.1 + 0.2; // 0.30000000000000004
Decimal.from("0.1").add("0.2").toString(); // "0.3"
```

## Example

```ts
import { Decimal } from "decimal-ts";

const subtotal = Decimal.from("19.99").mul(3);
const tax = subtotal.mul("0.0825").round(2, "HALF_UP");
const total = subtotal.add(tax);
console.log(total.toFixed(2));
```

## Architecture

```mermaid
flowchart LR
    Input --> Parser
    Parser --> Pair["coefficient + exponent"]
    Pair --> BigIntArithmetic
    BigIntArithmetic --> Rounding
    Rounding --> Formatting
```

## Correctness Notes

- Addition, subtraction, and multiplication are exact.
- Division requires explicit scale and rounding mode.
- Seven rounding modes are implemented and tested.
- JSON serialization returns strings to avoid precision loss.

## Comparison

| Need | `number` | `decimal-ts` |
|---|---|---|
| Fast approximate math | Yes | Not the goal |
| Exact decimal cents | No | Yes |
| Explicit rounding policy | Manual | Built in |
| Zero runtime deps | Yes | Yes |

## Development

```bash
npm install
npm run typecheck
npm test
npm pack --dry-run
npm run benchmark
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md), [TECHNICAL_ARTICLE.md](docs/TECHNICAL_ARTICLE.md), and [RELEASE.md](RELEASE.md).
