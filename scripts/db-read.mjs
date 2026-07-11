#!/usr/bin/env node
/**
 * Read-only production DB query helper (ported from RFQ Hunter's proven
 * pattern via the Genesis Kit port-sources list).
 *
 * Opens a READ ONLY transaction (default_transaction_read_only + BEGIN READ
 * ONLY), so any INSERT/UPDATE/DELETE/DDL errors out — this can only ever
 * read. DATABASE_URL is loaded from core/.env.local (resolved relative to
 * this file, so cwd doesn't matter).
 *
 * Usage:
 *   node scripts/db-read.mjs "SELECT id, name FROM clients WHERE id = $1" <uuid>
 *   node scripts/db-read.mjs "SELECT count(*) FROM automations"
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env.local");
const url = (readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.*)$/m) || [])[1]
  ?.trim()
  .replace(/^["']|["']$/g, "");
if (!url) {
  console.error(`DATABASE_URL not found in ${envPath}`);
  process.exit(1);
}

const sql = process.argv[2];
if (!sql) {
  console.error('Usage: node scripts/db-read.mjs "SELECT ..." [param1 param2 ...]');
  process.exit(1);
}
const params = process.argv.slice(3);

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  await client.query("SET default_transaction_read_only = on");
  await client.query("BEGIN READ ONLY");
  const res = await client.query(sql, params.length ? params : undefined);
  console.table(res.rows);
  console.log(`(${res.rowCount} row${res.rowCount === 1 ? "" : "s"})`);
  await client.query("ROLLBACK");
} catch (e) {
  console.error("ERR", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
