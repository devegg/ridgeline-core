/**
 * Apply SQL migrations against the prod DB (DATABASE_URL from .env.local).
 * Pattern adopted from RFQ Hunter via the Genesis Kit rule: numbered
 * migrations applied with the runner — never hand-paste SQL anywhere.
 *
 *   npm run migrate                                  # apply ALL pending migrations, in order
 *   node scripts/run-migration.mjs <file-in-migrations>   # apply one specific migration
 *   node scripts/run-migration.mjs scripts/seed-portal-demo.sql   # one-off SQL (seeds) — applied, not tracked
 *
 * Tracking: a `schema_migrations` table records applied filenames so
 * `npm run migrate` only runs what's new. BOOTSTRAP: everything through
 * BASELINE below was hand-applied in the SQL editor before this runner
 * existed; the first run records those as applied and treats anything
 * after as pending.
 *
 * Owner-run: applying to prod is gated to a human on purpose. This script
 * just makes "what do I type" a non-question.
 */
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const MIG_DIR = "supabase/migrations";
// Last migration applied by hand, before the runner existed (2026-07-11).
const BASELINE = "20260110000000_leads_anon_inbound_insert.sql";
const arg = process.argv[2]; // optional explicit file (migration name, or a path for one-off SQL)

const env = fs.readFileSync(path.resolve(".env.local"), "utf8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
if (!line) {
  console.error("DATABASE_URL not found in .env.local — add the Postgres connection string from Supabase (Connect → Session pooler).");
  process.exit(1);
}
const connectionString = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");

const allFiles = fs
  .readdirSync(path.resolve(MIG_DIR))
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function apply(client, f) {
  const sql = fs.readFileSync(path.resolve(MIG_DIR, f), "utf8");
  await client.query(sql);
  await client.query(
    "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO UPDATE SET applied_at = now()",
    [f],
  );
  console.log(`✓ applied ${f}`);
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  // One-off SQL outside the migrations dir (seeds, fixes): apply, don't track.
  if (arg && !allFiles.includes(path.basename(arg)) && fs.existsSync(path.resolve(arg))) {
    const sql = fs.readFileSync(path.resolve(arg), "utf8");
    await client.query(sql);
    console.log(`✓ applied one-off ${arg} (not recorded in schema_migrations)`);
    process.exit(0);
  }

  const { rows: pre } = await client.query("SELECT to_regclass('public.schema_migrations') AS t");
  const firstRun = !pre[0].t;
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );

  // Bootstrap: record the hand-applied era (≤ BASELINE) without re-running it.
  if (firstRun) {
    const preRunner = allFiles.filter((f) => f <= BASELINE);
    for (const f of preRunner) {
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING", [f]);
    }
    console.log(`✓ initialized schema_migrations — ${preRunner.length} pre-runner migration(s) marked applied (through ${BASELINE}).`);
  }

  if (arg) {
    await apply(client, path.basename(arg));
  } else {
    const { rows: done } = await client.query("SELECT filename FROM schema_migrations");
    const doneSet = new Set(done.map((r) => r.filename));
    const pending = allFiles.filter((f) => !doneSet.has(f));
    if (pending.length === 0) {
      console.log("✓ up to date — no pending migrations.");
    } else {
      for (const f of pending) await apply(client, f);
      console.log(`✓ done — ${pending.length} migration(s) applied.`);
    }
  }
} finally {
  await client.end();
}
