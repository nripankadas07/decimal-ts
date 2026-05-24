# Architecture

`decimal-ts` thesis: exact fixed-point decimal arithmetic on BigInt for money-style calculations.

```mermaid
flowchart LR
    A0["Parse Input"]
    A1["Coefficient + Exponent"]
    A2["BigInt Arithmetic"]
    A3["Explicit Rounding"]
    A4["Formatting"]
    A0 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> A4
```

## Design Rules

- Keep the public API small enough to inspect in one sitting.
- Make demos run locally without network credentials.
- Put correctness checks in tests, conformance scripts, or benchmark scripts
  instead of relying on README claims.
- Prefer explicit failure modes over surprising implicit behavior.
