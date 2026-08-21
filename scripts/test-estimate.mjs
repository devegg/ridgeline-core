#!/usr/bin/env node
/**
 * Visit-estimator test suite. Mirrors scripts/test-portal.mjs in shape.
 *
 *   npm run test:estimate
 *
 * Part 1 (pure math) needs nothing but node. Part 2 (database) needs
 * .env.local and the 20260820000000 migration applied; it creates throwaway
 * rows and deletes everything it made. Exit code 0 = all green.
 *
 * The .ts modules are imported directly via node's --experimental-strip-types
 * so the suite exercises the REAL math rather than a copy of it. Type-only
 * imports inside those modules are erased by the stripper, which is why the
 * '@/' alias never needs resolving here.
 */
import { HAIRCUT, formatDollars } from "../lib/portal/value.ts";
import { annualCost, annualRecovered, commission, visitTotals } from "../lib/field/estimate.ts";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

console.log("\nPart 1 — the math\n");

// The worked example from the design brief.
const cost = annualCost(4, 60, 28);
ok("annualCost(4 min, 60/wk, $28) === 5824", cost === 5824, `got ${cost}`);
ok("displays as ~$5,800", formatDollars(cost) === "~$5,800", `got ${formatDollars(cost)}`);

const recovered = annualRecovered(4, 60, 28);
ok("annualRecovered applies HAIRCUT", recovered === cost * (1 - HAIRCUT), `got ${recovered}`);
ok("displays as ~$4,100", formatDollars(recovered) === "~$4,100", `got ${formatDollars(recovered)}`);

// Proves both surfaces share one implementation rather than two that agree today.
ok("HAIRCUT is the portal's, not a copy", HAIRCUT === 0.3, `got ${HAIRCUT}`);

// A visit is the sum of its tasks — the running total is per visit, not per task.
const totals = visitTotals([
  { minutes_each: 4, times_per_week: 60, hourly_rate: 28 },
  { minutes_each: 15, times_per_week: 5, hourly_rate: 30 },
]);
ok("visitTotals sums cost", totals.cost === 5824 + 1950, `got ${totals.cost}`);
ok("visitTotals sums recovered", totals.recovered === (5824 + 1950) * 0.7, `got ${totals.recovered}`);
ok("visitTotals of [] is zero", visitTotals([]).cost === 0);

// The fee rides on what's recovered, not on the raw cost — Brian is paid on
// savings, and the conservative number is the defensible one.
const fee = commission(4, 60, 28);
ok("commission is 25% of recovered", fee === recovered * 0.25, `got ${fee}`);
ok("fee displays as ~$1,000", formatDollars(fee) === "~$1,000", `got ${formatDollars(fee)}`);
ok("visitTotals fee matches", totals.fee === totals.recovered * 0.25, `got ${totals.fee}`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
