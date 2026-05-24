# decimal-ts: no more floating-point money bugs

This is a launch-ready technical article draft for the repository. It is meant
to explain the idea, not inflate traction.

## The Problem

JavaScript numbers are binary floating point. That is the wrong default for money, tax, and settlement logic.

## The Core Idea

Store finite decimals as `coefficient * 10^exponent`; arithmetic stays exact until division or explicit rounding.

## Correctness Notes

Rounding modes are named and tested, including half-even ties. JSON serialization returns strings to avoid precision loss.

## Limitations

This is not a financial ledger. It gives exact arithmetic; domain policy still belongs in application code.

## Try It

Run the README demo from a clean checkout. If the demo needs credentials, it is
not a good flagship demo.
