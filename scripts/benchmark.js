"use strict";

const { Decimal } = require("../dist");

const start = process.hrtime.bigint();
let value = Decimal.ZERO;
for (let i = 0; i < 10000; i += 1) {
  value = value.add("0.01").mul("1.0001").round(4, "HALF_EVEN");
}
const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
console.log(`value=${value.toString()}`);
console.log(`local_elapsed_ms=${elapsedMs.toFixed(3)}`);
