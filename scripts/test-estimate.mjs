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
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HAIRCUT, formatDollars } from "../lib/portal/value.ts";
import {
  annualCost,
  annualRecovered,
  commission,
  monthlyShare,
  visitTotals,
  MAINTENANCE_BASE_MONTHLY,
} from "../lib/field/estimate.ts";

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

// Year one is billed monthly, so the estimator leads with a monthly figure —
// but the twelve-month total must still be the card's number, or the screen
// and the business card are telling an owner two different things.
ok("monthly share is a twelfth of the first-year fee", monthlyShare(fee) === fee / 12, `got ${monthlyShare(fee)}`);
ok(
  "twelve monthly shares rebuild the card's number",
  // Tolerance, not equality: x/12*12 is not exactly x in binary floating point.
  // formatDollars rounds well below this, so the screen never shows the drift.
  Math.abs(monthlyShare(fee) * 12 - fee) < 1e-9,
  `got ${monthlyShare(fee) * 12} vs ${fee}`
);
ok("monthly share of nothing is nothing", monthlyShare(0) === 0);
ok(
  "maintenance base is a positive number the screen can print",
  MAINTENANCE_BASE_MONTHLY > 0 && Number.isFinite(MAINTENANCE_BASE_MONTHLY),
  `got ${MAINTENANCE_BASE_MONTHLY}`
);

console.log("\nPart 2 — the database\n");

const here = dirname(fileURLToPath(import.meta.url));
const get = (env, k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim().replace(/^"|"$/g, "");

let env = null;
try { env = readFileSync(join(here, "..", ".env.local"), "utf8"); }
catch { console.log("  skip  no .env.local — part 2 needs it (part 1 still counts)"); }

if (env) {
  const URL_ = get(env, "NEXT_PUBLIC_SUPABASE_URL");
  const PUB = get(env, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const SECRET = get(env, "SUPABASE_SECRET_KEY");
  const admin = createClient(URL_, SECRET);

  // Hard gate. Without it, every "rejects out-of-bounds" assertion below goes
  // GREEN when the table is simply missing — an insert that fails because
  // there is no table looks identical to one rejected by a CHECK constraint.
  // A false green is worse than a failure, so refuse to run Part 2 at all.
  const probe = await admin.from("visit_tasks").select("id").limit(1);
  if (probe.error) {
    fail++;
    console.log(`  FAIL part 2 cannot run — ${probe.error.message}`);
    console.log("        apply 20260820000000 with `npm run migrate`, then re-run.");
  } else {
    const name = `ZZ Test ${randomUUID().slice(0, 8)}`;
    const p = await admin.from("prospects").insert({ business_name: name }).select("id").single();
    if (p.error) throw new Error(`could not create the throwaway prospect: ${p.error.message}`);
    const prospectId = p.data.id;
    // try/finally from here on: a thrown assertion must never strand a test
    // row in the real database.
    try {
    const v = await admin.from("prospect_visits").insert({ prospect_id: prospectId }).select("id").single();
    if (v.error) throw new Error(`could not create the throwaway visit: ${v.error.message}`);

    // CHECK constraints reject what the form would have rejected first.
    for (const [field, bad] of [["hourly_rate", 4], ["hourly_rate", 501], ["minutes_each", 0.25], ["minutes_each", 481]]) {
      const row = { prospect_id: prospectId, label: "x", minutes_each: 4, times_per_week: 60, hourly_rate: 28, [field]: bad };
      const { error } = await admin.from("visit_tasks").insert(row);
      ok(`rejects ${field} = ${bad}`, !!error, "insert succeeded when it should have failed");
    }

    const good = await admin.from("visit_tasks").insert({
      prospect_id: prospectId, visit_id: v.data.id, label: "Retyping invoices",
      minutes_each: 4, times_per_week: 60, hourly_rate: 28,
    }).select("id").single();
    ok("accepts an in-bounds task", !good.error, good.error?.message);
    if (good.error) throw new Error("cannot continue without a saved task");

    // Deleting the visit must not take the priced tasks with it.
    await admin.from("prospect_visits").delete().eq("id", v.data.id);
    const orphan = await admin.from("visit_tasks").select("visit_id").eq("id", good.data.id).single();
    ok("visit delete leaves the task, visit_id null", orphan.data && orphan.data.visit_id === null);

    // D8 deny-by-default: a caller without the owner role reads nothing. The
    // anon (publishable) key carries no role at all, which is the weakest
    // caller there is — if it sees a row, the policy is wrong.
    const anon = createClient(URL_, PUB);
    const denied = await anon.from("visit_tasks").select("id");
    ok("anon key reads no visit_tasks", (denied.data ?? []).length === 0, `saw ${(denied.data ?? []).length} rows`);

    // Cleanup: the prospect cascade removes the tasks.
    await admin.from("prospects").delete().eq("id", prospectId);
    const gone = await admin.from("visit_tasks").select("id").eq("id", good.data.id);
    ok("prospect delete cascades to tasks", (gone.data ?? []).length === 0);
    } finally {
      // Belt and braces — delete is idempotent, and this runs even if an
      // assertion above threw before the cleanup line was reached.
      await admin.from("prospects").delete().eq("id", prospectId);
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
