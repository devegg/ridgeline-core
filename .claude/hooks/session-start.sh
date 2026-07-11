#!/usr/bin/env bash
# SessionStart hook: print the "start here" reminder as context. No blocking.
# Mirrors CLAUDE.md "## Start here, every session".
echo "ridgeline-core — before new work: read docs/STATUS.md (status authority) and docs/decisions-log.md (decisions authority), check docs/__inbox/ (act on files in its root; ignore hold/), and consult the ridgeline-core-doc-sync skill (run its reconciliation pass at session end and after any PR/migration). DB changes go through scripts/run-migration.mjs — never hand-paste SQL."
exit 0
