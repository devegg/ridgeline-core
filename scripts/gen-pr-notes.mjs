#!/usr/bin/env node
// gen-pr-notes.mjs — regenerate docs/PR-NOTES.md from the merged-PR history on GitHub.
//
//   node scripts/gen-pr-notes.mjs        (run from the repo root; needs an authed `gh`)
//
// Ported from RFQ Hunter 2026-08-22 (its D97). The workspace's `scripts/snapshot.sh`
// already looks for this file and runs it when present — core did not have it, so
// every snapshot uploaded to a claude.ai Project shipped with no PR history at all.
// It warned and carried on, which is why nobody noticed.
//
// PR-NOTES.md is the DETAILED companion to the Release Log in docs/STATUS.md: STATUS
// stays the terse narrative of what shipped; this carries the full body of every
// merged PR, newest first. Being a tracked .md under docs/, it rides along in the
// combine-files snapshot so the planning side can read the whole history.
//
// GENERATED — do not hand-edit PR-NOTES.md. Re-run after merging a PR, as part of
// the doc-sync pass. Because it reads GitHub (the source of truth) it cannot
// silently drift from what actually shipped — which is the entire point: it is a
// generator, not a document somebody has to remember to update.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..");
const OUT = path.join(REPO, "docs", "PR-NOTES.md");

const raw = execFileSync(
  "gh",
  ["pr", "list", "--state", "merged", "--limit", "1000", "--json", "number,title,body,mergedAt,mergeCommit"],
  { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 },
);
const prs = JSON.parse(raw).sort((a, b) => b.number - a.number);

if (prs.length === 0) {
  console.error("No merged PRs found — is `gh` authed against the right repo?");
  process.exit(1);
}

const cleanBody = (body) =>
  (body || "")
    .replace(/\r\n/g, "\n")
    // drop the repeated "🤖 Generated with [Claude Code]…" footer — noise across hundreds of entries
    .replace(/\n*🤖 Generated with \[Claude Code\]\([^)]*\)\s*$/i, "")
    .trim() || "_(no description)_";

const header = [
  "# PR Notes — full history",
  "",
  "> **Canonical, detailed PR log.** The full body of every merged PR, newest first — the detailed",
  "> companion to the release narrative in `docs/STATUS.md`. STATUS stays the readable account of what",
  "> shipped and why; this holds everything each PR actually said. Tracked under `docs/`, so",
  "> `scripts/combine-files.cjs` carries it into the snapshot and the planning side gets the whole",
  "> history.",
  ">",
  "> **GENERATED — do not hand-edit.** Regenerate with `node scripts/gen-pr-notes.mjs` (needs an authed",
  "> `gh`); re-run after merging a PR, as part of the doc-sync pass. Reading GitHub directly means it",
  "> can never silently drift from what actually shipped.",
  "",
  `_Generated ${new Date().toISOString().slice(0, 10)} from ${prs.length} merged PRs (#${prs[prs.length - 1]?.number}–#${prs[0]?.number})._`,
  "",
  "---",
  "",
].join("\n");

const body = prs
  .map((pr) => {
    const date = (pr.mergedAt || "").slice(0, 10);
    const sha = (pr.mergeCommit?.oid || "").slice(0, 7);
    const meta = [date && `merged ${date}`, sha && `\`${sha}\``].filter(Boolean).join(" · ");
    return `## #${pr.number} — ${pr.title}\n${meta ? meta + "\n" : ""}\n${cleanBody(pr.body)}\n`;
  })
  .join("\n---\n\n");

writeFileSync(OUT, header + body + "\n");
console.log(`PR-NOTES.md — ${prs.length} PRs (#${prs[prs.length - 1]?.number}–#${prs[0]?.number}) → ${path.relative(REPO, OUT)}`);
