# ridgeline-core — Claude Code project memory

The Ridgeline app: marketing site (ridgelineknows.com) + owner ops dashboard +
client portal, one Next.js app at the repo root. Workspace-wide rules inherit
from `../CLAUDE.md` (the Ridgeline workspace master memory) — voice, naming
policy, migrate-on-commitment, branch-by-default. This file adds what is
core-specific.

## Start here, every session (before any new work)

1. Read `docs/STATUS.md` (the **status authority**: what is actually shipped)
   and `docs/decisions-log.md` (the **decisions authority**: locked D#s + the
   open-items register).
2. Check `docs/__inbox/` — act on every file in its ROOT (ignore `hold/`;
   archive landed files to `completed/`, moved individually, never the folder).
3. Consult the `ridgeline-core-doc-sync` skill; run its reconciliation pass at
   session end and after any PR or migration.

## Database changes are safety-critical

Never run SQL directly against the database, and never hand-paste SQL into
the Supabase dashboard — including one-off fixes. Every schema or data change
is a SQL file applied with `scripts/run-migration.mjs` (`npm run migrate` for
pending migrations; a file path for one-off seeds/fixes). Read-only inspection
goes through `scripts/db-read.mjs`. The runner refuses a DATABASE_URL whose
project ref differs from the app's Supabase URL; `ALLOW_REF_MISMATCH=1` only
for a deliberate cross-project run. Prod applies are owner-run on purpose.

## After every PR/merge: verify the deploy

Merged is not shipped. Pushes to `master` auto-deploy (Vercel, git-connected).
After merging, confirm CI is green AND production reflects `master` HEAD
(`vercel ls ridgeline-core` in the FOREGROUND — the CLI returns empty output in
background shells — or curl a route only the new code serves). Back-to-back
merges can make Vercel build only one push.

## Roles are explicit, deny by default

Owner access requires `app_metadata.role = 'owner'` (code and RLS); clients
carry `role = 'client'` + `client_id`. An account with no role gets nothing.
Public sign-ups stay DISABLED in Supabase Auth; the app never self-registers
users. Provisioning: docs/setup/CLIENT-PORTAL-RUNBOOK.md.

## Honesty rails

- Never fabricate facts, stats, or client results (workspace rule). Demo data
  is clearly labeled ("Demo Client (Sample Data)") and never presented as real.
- Copy/docs vs code mismatches are "ahead of the code," fixed by aligning the
  doc — never framed as dishonesty.
- Salem is never named publicly — ACME Manufacturing is the stage name.
- The portal's value numbers ride `lib/portal/value.ts` (30% haircut, rounding
  rules) — every surface computes from that one module, never ad hoc.

## Conventions

- Stack: Next.js 15 App Router + React 19 + TS + Tailwind v4 (CSS-first, no
  config file; tokens in `app/globals.css`). Supabase via `@supabase/ssr`
  (`lib/supabase/server.ts` server, `client.ts` browser, keys resolved in
  `lib/supabase/keys.ts` — NEW `sb_publishable_` keys, legacy fallback until
  disabled). npm. Vercel.
- Branch-by-default → PR to `master`. Never `git add -A`/`git add .` — stage
  explicitly. Hooks enforce the mechanically blockable subset.
- Before a PR that changes code: `npx tsc --noEmit` always; run the full
  `npm run build` only with the dev server stopped (they share `.next`).
- Naming going forward: kebab-case docs; `_` prefix = tracked-special,
  `__` prefix = untracked local (`docs/__inbox/`, `docs/__retired/`).
- New decisions get the next D# in `docs/decisions-log.md` — read the
  COMMITTED log for the next number; D#s are never reused.
