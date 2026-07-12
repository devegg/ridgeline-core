#!/usr/bin/env node
/**
 * Portal test suite — security, isolation, ingest, light stress.
 * See docs/plans/TEST-PLAN-portal.md.
 *
 * Run (local target needs the dev server up; works from either folder):
 *
 *   cd /Users/brianboyd/0/ridgeline/core && npm run test:portal
 *   node core/scripts/test-portal.mjs                    # from the workspace root
 *   BASE_URL=https://www.ridgelineknows.com npm run test:portal   # against production
 *
 * Creates an ephemeral client login + throwaway rows; deletes everything it
 * made. Exit code 0 = all green.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(here, "..", ".env.local"), "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim().replace(/^"|"$/g, "");

const URL_ = get("NEXT_PUBLIC_SUPABASE_URL");
const PUB = get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const SECRET = get("SUPABASE_SECRET_KEY");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const DEMO = "de300000-0000-4000-8000-000000000001";   // Demo Client (Sample Data)
const COASTAL = "dfde0000-0000-4000-8000-000000000001"; // Coastal Cottage Rentals (Demo)
const COASTAL_PROPOSAL = "dfde0000-0000-4000-8000-000000000071"; // pending

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const status = async (path, init) => {
  try { return (await fetch(`${BASE}${path}`, { redirect: "manual", ...init })).status; }
  catch { return -1; }
};

// ============================================================
console.log("A. Public surface");
ok("home 200", (await status("/")) === 200);
ok("login 200", (await status("/login")) === 200);
ok("papers reads the DB", await fetch(`${BASE}/papers`).then(r => r.text()).then(t => t.includes("RFQ Hunter")).catch(() => false));
ok("intake page 200", (await status(`/intake/${randomUUID()}`)) === 200);
ok("portal gated 307", (await status("/portal")) === 307);
ok("dashboard gated 307", (await status("/overview")) === 307);
ok("cron unauth 401", (await status("/api/cron/monthly-reports")) === 401);
ok("ingest activity keyless 401", (await status("/api/ingest/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })) === 401);
ok("ingest issue keyless 401", (await status("/api/ingest/issue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: "x" }) })) === 401);
ok("ingest activity bad key 401", (await status("/api/ingest/activity", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer rk_ingest_WRONG_00000000000000000000" }, body: JSON.stringify({ automation_id: randomUUID(), items_processed: 1 }) })) === 401);

// ============================================================
console.log("B. RPC hardening (anonymous)");
const anon = createClient(URL_, PUB, { auth: { persistSession: false } });
{
  const { error } = await anon.rpc("submit_intake", { p_token: randomUUID(), p_answers: { a: 1 } });
  ok("submit_intake unknown token refused", !!error);
  const { data } = await anon.rpc("intake_context", { p_token: randomUUID() });
  ok("intake_context unknown token empty", !data || data.length === 0);
  const { error: appErr } = await anon.rpc("approve_proposal", { p_proposal: COASTAL_PROPOSAL });
  ok("approve_proposal without session refused", !!appErr);
  const { error: ingErr } = await anon.rpc("ingest_activity", { p_key: "short", p_automation: randomUUID(), p_on: "2026-01-01", p_items: 1 });
  ok("ingest_activity bad key refused", !!ingErr);
}

// ============================================================
console.log("C. Tenant isolation (ephemeral client login)");
const admin = createClient(URL_, SECRET, { auth: { persistSession: false } });
const testEmail = `test-suite+${Date.now()}@ridgelineknows.test`;
const testPw = `rk-test-${randomBytes(10).toString("base64url")}`;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: testEmail, password: testPw, email_confirm: true,
  app_metadata: { role: "client", client_id: DEMO },
});
ok("ephemeral client user created", !createErr, createErr?.message);
const testUserId = created?.user?.id;

const client = createClient(URL_, PUB, { auth: { persistSession: false } });
const { error: signInErr } = await client.auth.signInWithPassword({ email: testEmail, password: testPw });
ok("client sign-in works", !signInErr, signInErr?.message);

if (!signInErr) {
  const { data: myClients } = await client.from("clients").select("id, name");
  ok("sees exactly own client row", myClients?.length === 1 && myClients[0].id === DEMO, `got ${myClients?.length}`);

  const { data: autos } = await client.from("automations").select("id, client_id");
  ok("automations: own only", (autos ?? []).length > 0 && (autos ?? []).every(a => a.client_id === DEMO));

  for (const table of ["caught_issues", "roadmap_items", "portal_highlights", "change_requests", "proposals", "invoices"]) {
    const { data } = await client.from(table).select("client_id").eq("client_id", COASTAL);
    ok(`${table}: zero foreign rows`, (data ?? []).length === 0, `leaked ${(data ?? []).length}`);
  }

  const { data: rawForeign } = await client.rpc("portal_value_raw", { p_client: COASTAL, p_month_start: "2026-07-01" });
  const rf = rawForeign?.[0];
  ok("value aggregate for foreign client is zeroed", !rf || Number(rf.launch_raw_minutes) === 0, JSON.stringify(rf ?? null));

  const { error: crossApprove } = await client.rpc("approve_proposal", { p_proposal: COASTAL_PROPOSAL });
  ok("cannot approve another client's proposal", !!crossApprove);

  const { error: forge1 } = await client.from("change_requests").insert({
    client_id: DEMO, created_by: testUserId, title: "forged done", status: "done", response: "fake reply",
  });
  ok("forged pre-answered request refused", !!forge1);

  const { error: forge2 } = await client.from("change_requests").insert({
    client_id: DEMO, created_by: randomUUID(), title: "spoofed author",
  });
  ok("spoofed created_by refused", !!forge2);

  const { error: forge3 } = await client.from("change_requests").insert({
    client_id: COASTAL, created_by: testUserId, title: "cross-tenant request",
  });
  ok("cross-tenant request refused", !!forge3);

  const { data: cleanReq, error: cleanErr } = await client.from("change_requests")
    .insert({ client_id: DEMO, created_by: testUserId, title: "suite: clean request" })
    .select("id").single();
  ok("clean request insert succeeds", !cleanErr && !!cleanReq, cleanErr?.message);
  if (cleanReq) await admin.from("change_requests").delete().eq("id", cleanReq.id);

  const { error: writeAuto } = await client.from("automations")
    .update({ name: "hacked" }).eq("client_id", DEMO);
  const { data: autosAfter } = await client.from("automations").select("name").eq("client_id", DEMO);
  ok("client cannot rewrite automations", !!writeAuto || (autosAfter ?? []).every(a => a.name !== "hacked"));

  const { error: tierErr } = await client.from("clients").update({ plan_tier: "own" }).eq("id", DEMO);
  const { data: tierAfter } = await client.from("clients").select("plan_tier").eq("id", DEMO).single();
  ok("client cannot change own tier", !!tierErr || tierAfter?.plan_tier !== "own");

  // set_value_inputs — the client-owned savings inputs (migration 20260712000000).
  // Skips (without failing) until the migration is applied.
  const { data: rateBefore } = await client.from("clients").select("blended_labor_rate").eq("id", DEMO).single();
  const probe = await client.rpc("set_value_inputs", { p_rate: 60 });
  const missing = probe.error && /could not find|does not exist|schema cache/i.test(probe.error.message);
  if (missing) {
    console.log("  ~ set_value_inputs checks SKIPPED — run `npm run migrate` first");
  } else {
    ok("client can set own rate", !probe.error, probe.error?.message);
    const { data: rateNow } = await client.from("clients").select("blended_labor_rate").eq("id", DEMO).single();
    ok("rate change landed", Number(rateNow?.blended_labor_rate) === 60, `got ${rateNow?.blended_labor_rate}`);

    const { error: oobErr } = await client.rpc("set_value_inputs", { p_rate: 9000 });
    ok("out-of-bounds rate refused", !!oobErr);

    const { error: crossAuto } = await client.rpc("set_value_inputs", { p_automation: randomUUID(), p_minutes: 10 });
    ok("minutes on foreign/unknown automation refused", !!crossAuto);

    const { data: ownAutos } = await client.from("automations").select("id, baseline_minutes_per_item").eq("client_id", DEMO).limit(1);
    if (ownAutos?.length) {
      const auto = ownAutos[0];
      const orig = Number(auto.baseline_minutes_per_item);
      const { error: minErr } = await client.rpc("set_value_inputs", { p_automation: auto.id, p_minutes: orig + 1 });
      const { data: minNow } = await client.from("automations").select("baseline_minutes_per_item").eq("id", auto.id).single();
      ok("client can set own task minutes", !minErr && Number(minNow?.baseline_minutes_per_item) === orig + 1, minErr?.message);
      await admin.from("automations").update({ baseline_minutes_per_item: orig }).eq("id", auto.id);
    }
    // restore the demo rate exactly as found
    await admin.from("clients").update({ blended_labor_rate: rateBefore?.blended_labor_rate ?? 45 }).eq("id", DEMO);

    const anonVi = await anon.rpc("set_value_inputs", { p_rate: 60 });
    ok("set_value_inputs without session refused", !!anonVi.error);
  }
}

// ============================================================
console.log("D. Ingest round trip (armed key)");
{
  const key = `rk_ingest_suite_${randomBytes(16).toString("base64url")}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const { data: prev } = await admin.from("clients").select("ingest_key_hash, ingest_key_created_at").eq("id", DEMO).single();
  await admin.from("clients").update({ ingest_key_hash: hash, ingest_key_created_at: new Date().toISOString() }).eq("id", DEMO);

  const AUTO = "de300000-0000-4000-8000-00000000000a";
  // Inside the RPC's 366-day window, before the demo's seeded range, deleted after.
  const testDay = new Date(Date.now() - 300 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const actRes = await fetch(`${BASE}/api/ingest/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ automation_id: AUTO, activity_on: testDay, items_processed: 7 }),
  });
  ok("activity ingest 200 with good key", actRes.status === 200, `status ${actRes.status}`);
  const { data: actRow } = await admin.from("automation_activity").select("items_processed").eq("automation_id", AUTO).eq("activity_on", testDay).single();
  ok("activity row landed", actRow?.items_processed === 7);
  await admin.from("automation_activity").delete().eq("automation_id", AUTO).eq("activity_on", testDay);

  const issRes = await fetch(`${BASE}/api/ingest/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ summary: "suite: machine-reported test issue", status: "resolved" }),
  });
  const issBody = await issRes.json().catch(() => ({}));
  ok("issue ingest 200 with good key", issRes.status === 200, `status ${issRes.status}`);
  if (issBody.issue_id) await admin.from("caught_issues").delete().eq("id", issBody.issue_id);

  // restore whatever key state existed before the suite
  await admin.from("clients").update({ ingest_key_hash: prev?.ingest_key_hash ?? null, ingest_key_created_at: prev?.ingest_key_created_at ?? null }).eq("id", DEMO);
}

// ============================================================
console.log("E. Light stress (parallel bursts)");
{
  const burst = await Promise.all([
    ...Array.from({ length: 15 }, () => status("/")),
    ...Array.from({ length: 10 }, () => status("/portal")),
    ...Array.from({ length: 10 }, () => status("/api/ingest/activity", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer rk_ingest_WRONG_00000000000000000000" }, body: JSON.stringify({ automation_id: randomUUID(), items_processed: 1 }) })),
  ]);
  const fives = burst.filter(s => s >= 500 || s === -1).length;
  ok("35-request burst: zero 5xx", fives === 0, `${fives} bad`);
}

// ============================================================
if (testUserId) {
  await admin.auth.admin.deleteUser(testUserId);
  console.log("cleanup: ephemeral user deleted");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
