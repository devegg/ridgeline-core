#!/usr/bin/env node
// PreToolUse(Bash) guardrail: the standing lanes are never deleted.
// docs/__inbox/ and docs/__retired/ are UNTRACKED — a recursive rm there is
// unrecoverable and can destroy a task or a file awaiting owner review.
// docs/gitignored/ holds the papers' drafts of record (also untracked).
// Files move individually (e.g. into docs/__inbox/completed/); the folders
// themselves stay. Blocks with exit 2 + stderr; fails open on unparseable input.

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

const LANES = /(docs\/__inbox|docs\/__retired|docs\/gitignored)/;
if (!LANES.test(cmd)) process.exit(0);

const recursiveRm =
  /\brm\s+(?:[^|;&]*\s)?-(?!-)[a-zA-Z]*[rR][a-zA-Z]*\b/.test(cmd) ||
  /\brm\s+(?:[^|;&]*\s)?--recursive\b/.test(cmd);
const rmdir = /\brmdir\b/.test(cmd);

if (recursiveRm || rmdir) {
  process.stderr.write(
    "The standing lanes (docs/__inbox, docs/__retired, docs/gitignored) are never deleted — " +
      "they are untracked and a folder delete is unrecoverable. " +
      "Move files individually (archive to docs/__inbox/completed/).\n",
  );
  process.exit(2);
}
process.exit(0);
