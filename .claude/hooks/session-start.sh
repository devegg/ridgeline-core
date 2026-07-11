#!/usr/bin/env bash
# SessionStart hook: print the "start here" reminder as context. No blocking.
# Mirrors CLAUDE.md "## Start here, every session".
# Self-heals the untracked lanes (idempotent) — they are gitignored, so a
# fresh clone arrives without them and the ritual would point at nothing.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || true
mkdir -p docs/__inbox/hold docs/__inbox/completed docs/__retired 2>/dev/null || true
echo "ridgeline-core — before new work: read docs/STATUS.md (status authority) and docs/decisions-log.md (decisions authority), check docs/__inbox/ (act on files in its root; ignore hold/), and consult the ridgeline-core-doc-sync skill (run its reconciliation pass at session end and after any PR/migration). DB changes go through scripts/run-migration.mjs — never hand-paste SQL."
exit 0
