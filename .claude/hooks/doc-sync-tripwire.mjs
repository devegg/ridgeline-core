#!/usr/bin/env node
// Stop-hook tripwire: silent unless today's commits outran the authorities.
// If commits landed today but neither docs/STATUS.md nor docs/decisions-log.md
// was touched today, block the stop ONCE with a reminder to run the
// reconciliation pass (or to state why no doc update is warranted).
// stop_hook_active guards against loops. Fails open (exit 0) on any error.

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
let input = {};
try {
  input = JSON.parse(raw) ?? {};
} catch {
  process.exit(0);
}
if (input.stop_hook_active) process.exit(0); // already continued once — pass

const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (args) =>
  execSync(`git -C "${dir}" ${args}`, { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();

try {
  const commitsToday = git("log --oneline --since=midnight -- .");
  if (!commitsToday) process.exit(0); // nothing shipped today — nothing to sync
  const authorityToday = git("log --oneline --since=midnight -- docs/STATUS.md docs/decisions-log.md");
  if (authorityToday) process.exit(0); // authorities kept up — clean
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Commits landed today but the authorities (docs/STATUS.md, " +
        "docs/decisions-log.md) were not touched — run the " +
        "ridgeline-core-doc-sync reconciliation pass, or state explicitly " +
        "why no doc update is warranted, before finishing.",
    }),
  );
  process.exit(0);
} catch {
  process.exit(0);
}
