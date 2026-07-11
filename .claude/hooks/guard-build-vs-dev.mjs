#!/usr/bin/env node
// PreToolUse(Bash) guardrail: no production build while a dev server runs.
// A `next build` during `next dev` corrupts the build dir (real incident in a
// prior project). Verify with typecheck + lint instead, or stop the dev
// server around the build. Blocks with exit 2 + stderr; fails open otherwise.

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
if (!cmd) process.exit(0);
if (!/\b(?:npm\s+run\s+build|npx\s+next\s+build|next\s+build)\b/.test(cmd))
  process.exit(0);

let devRunning = false;
try {
  const out = execSync('pgrep -f "next dev"', {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
  devRunning = out.length > 0;
} catch {
  devRunning = false; // pgrep exits 1 when no match — no dev server
}

if (devRunning) {
  process.stderr.write(
    "A dev server is running — a production build now corrupts its build dir. " +
      "Stop the dev server first, or verify with `npx tsc --noEmit` + eslint instead of a full build.\n",
  );
  process.exit(2);
}
process.exit(0);
