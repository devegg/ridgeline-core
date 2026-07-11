#!/usr/bin/env node
// PreToolUse(Bash) guardrail: commits land on branches (branch-by-default).
// main takes only the sanctioned exceptions — the birth commit and a pure
// deploy nudge — made deliberate by prefixing the command with ALLOW_MAIN=1.
// Blocks with exit 2 + stderr; fails open on any error.

import { execSync } from "node:child_process";

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
if (!cmd || !/\bgit\s+commit\b/.test(cmd)) process.exit(0);
if (/\bALLOW_MAIN=1\b/.test(cmd)) process.exit(0);

let branch = "";
try {
  branch = execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {
  process.exit(0); // not a repo yet (e.g., pre-birth) — let it through
}

if (branch === "main" || branch === "master") {
  process.stderr.write(
    `On ${branch} — branch first (branch-by-default → PR). ` +
      "For the sanctioned exceptions only (birth commit, deploy nudge), run: ALLOW_MAIN=1 git commit …\n",
  );
  process.exit(2);
}
process.exit(0);
