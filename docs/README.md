# docs/

Start here: **STATUS.md** (what is shipped) and **decisions-log.md** (locked
D#s + open items) — the two authorities. Code is ground truth; docs reconcile
to code.

- `decisions/` — detailed decision records (ADR-100+; the log indexes them)
- `plans/` — build plans, tracked and kept (build from the file)
- `setup/` — runbooks (client-portal provisioning, etc.)
- `client/` — client context and history
- `__inbox/` — untracked task lane (root = live; `hold/` = not ready;
  `completed/` = archive)
- `__retired/` — untracked holding pen for retired files awaiting owner review
- `gitignored/` — papers' drafts of record (untracked; see STATUS)

Older taxonomy-era docs (architecture/, the feature matrix) were retired
2026-07-11 (D11) into `__retired/`.
