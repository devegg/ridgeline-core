#!/usr/bin/env node
// PreToolUse(Bash) guardrail: hard-block blanket staging.
// Rule (AGENTS.md): stage files explicitly. `git add -A`, `git add .`, and
// `git commit -a` sweep unrelated junk — and secrets — into the commit.
// Blocks with exit 2 + stderr; fails open on unparseable input.

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
if (!cmd || !/\bgit\b/.test(cmd)) process.exit(0);

const PATTERNS = [
  /\bgit\s+add\s+(?:[^|;&]*\s)?(?:-A\b|--all\b)/, // git add -A / --all
  /\bgit\s+add\s+\.(?:\s|$|;|&)/, // git add .
  /\bgit\s+commit\s+(?:[^|;&]*\s)?--all\b/, // git commit --all
  /\bgit\s+commit\s+(?:[^|;&]*\s)?-(?!-)[a-zA-Z]*a[a-zA-Z]*\b/, // -a / -am (not --amend)
];

if (PATTERNS.some((re) => re.test(cmd))) {
  process.stderr.write(
    "Blanket staging is blocked (AGENTS.md rule): stage files explicitly — `git add <paths>`. " +
      "`git add -A`, `git add .`, and `git commit -a` sweep unrelated files (and secrets) into the commit.\n",
  );
  process.exit(2);
}
process.exit(0);
