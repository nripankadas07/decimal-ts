"use strict";

const { Decimal } = require("../dist");

const subtotal = Decimal.from("19.99").mul(3);
const discount = subtotal.mul("0.15").round(2, "HALF_EVEN");
const tax = subtotal.sub(discount).mul("0.0825").round(2, "HALF_UP");
const total = subtotal.sub(discount).add(tax);

console.log(`subtotal=${subtotal.toFixed(2)}`);
console.log(`discount=${discount.toFixed(2)}`);
console.log(`tax=${tax.toFixed(2)}`);
console.log(`total=${total.toFixed(2)}`);
console.log(`0.1 + 0.2 = ${Decimal.from("0.1").add("0.2").toString()}`);
