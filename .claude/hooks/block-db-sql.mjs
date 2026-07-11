#!/usr/bin/env node
// PreToolUse(Bash) guardrail: hard-block SQL executed directly against the
// database OUTSIDE the sanctioned migration runner.
//
// Project rule (CLAUDE.md / AGENTS.md): every schema or data change is a
// numbered migration file applied by scripts/run-migration.mjs. Hand-run SQL
// (psql, supabase db push/execute/reset, inline -c "DDL…") is forbidden —
// including one-off "just this once" fixes.
//
// Blocks (exit 2 + stderr):
//   - psql                              (interactive/one-shot SQL client)
//   - supabase db push|execute|reset    (CLI direct-to-DB schema ops)
//   - -c / --command "<CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE …>"
// Does NOT block:
//   - node scripts/run-migration.mjs …  (the allowed runner — explicit allow)
//   - authoring a .sql file (that writes a file, not the DB)
// Fails open on unparseable input.

const read = (s) =>
  new Promise((r) => {
    let b = "";
    s.setEncoding("utf8");
    s.on("data", (c) => (b += c));
    s.on("end", () => r(b));
    s.on("error", () => r(b));
  });

const raw = await read(process.stdin);
let cmd = "";
try {
  cmd = JSON.parse(raw)?.tool_input?.command ?? "";
} catch {
  process.exit(0);
}
if (!cmd) process.exit(0);

// Explicit allow: the sanctioned migration runner is always permitted.
if (/run-migration\.mjs/.test(cmd)) process.exit(0);

const SQL_VERBS = "create|alter|drop|insert|update|delete|truncate|grant|revoke";
const PATTERNS = [
  /\bpsql\b/i,
  /\bsupabase\s+db\s+(?:push|execute|reset)\b/i,
  new RegExp(
    `(?:^|\\s)(?:-c|--command)(?:\\s*=\\s*|\\s+)?['"]?\\s*(?:${SQL_VERBS})\\b`,
    "i",
  ),
];

if (PATTERNS.some((re) => re.test(cmd))) {
  process.stderr.write(
    "Direct SQL against the database is blocked (CLAUDE.md rule): every schema/data " +
      "change is a numbered migration in the migrations folder, applied with " +
      "scripts/run-migration.mjs — including one-off fixes. Author the .sql file and run it through the runner.\n",
  );
  process.exit(2);
}
process.exit(0);
