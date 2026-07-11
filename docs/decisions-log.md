# ridgeline-core — Decisions Log & Open Items

> The decisions authority. Locked decisions override contrary prose anywhere
> in the repo; when a doc and this table disagree, the table wins and the doc
> gets aligned. New decisions take the next D# (read the COMMITTED log; never
> reuse a number). Detailed rationale for D1–D9 lives in
> `docs/decisions/ADR-100-portal-value-layer.md`; this table is the index of
> record. Workspace-level decisions live in `../docs/decisions/` (ADR-001..003).

**Last Updated:** 2026-07-11

## Locked decisions

| # | Decision | Detail | Overrides |
| --- | --- | --- | --- |
| D1 | Portal home is a value dashboard (2026-07-11) | `/portal` renders health banner → value scoreboard → peace of mind → caught & fixed → what's next; one data model (automations, automation_activity, caught_issues, roadmap_items, portal_highlights) will also feed the monthly report + case studies. ADR-100 §1 | The prior redirect-to-projects home |
| D2 | Honest math lives in code (2026-07-11) | 30% haircut + rounding rules are constants in `lib/portal/value.ts`, applied identically everywhere; dollars = post-haircut hours × `clients.blended_labor_rate` (a measured cost input, never a price claim); no decimals on estimates; aggregation in SQL (`portal_value_raw`) so totals can't truncate. ADR-100 §2/§9 | Ad-hoc per-surface math |
| D3 | Owners browse the portal, labeled (2026-07-11) | The portal is the demo/QA surface; owner views carry an "Owner preview" ribbon and home requires an explicit `?client=` pick; clients stay locked to their own `client_id` (app_metadata + RLS + explicit query filters). ADR-100 §3 | A hard owner lockout |
| D4 | change_requests is the first client WRITE (2026-07-11) | Insert policy requires client role AND jwt client_id AND `created_by = auth.uid()` AND `status='new'` with no response fields; the server action derives identity from the session, never the form. ADR-100 §4/§9 | — |
| D5 | Magic-link sign-in, never self-registration (2026-07-11) | `signInWithOtp` with `shouldCreateUser: false`; public sign-ups DISABLED in Supabase Auth (Email provider ON, sign-ups OFF); callback routes by role and only follows same-origin relative `next`. ADR-100 §5/§9 | — |
| D6 | Dark theme is portal-scoped (2026-07-11) | Tokens re-declared under `.portal-layout[data-theme="dark"]` (softened warm dark — glare kill, contrast kept); marketing + login stay warm-paper light; system default, localStorage persist. ADR-100 §6 | A site-wide theme |
| D7 | Migrations via the runner, never hand-pasted (2026-07-11) | `scripts/run-migration.mjs` (`npm run migrate`), BASELINE bootstrap for the ten hand-applied originals, one-off mode for seeds, project-ref guard (refuses a DATABASE_URL pointing at a different project — added after a real wrong-project incident, fully reverted). Read-only checks via `scripts/db-read.mjs`. ADR-100 §8/§9; workspace CLAUDE.md rule | The SQL-editor paste habit (the 20260108 GRANTs incident) |
| D8 | Deny-by-default roles (2026-07-11) | Owner access requires explicit `app_metadata.role='owner'` in middleware, layouts, pages, actions, and every owner_all RLS policy; migration 20260711100000 stamped existing users; unknown role = no access. ADR-100 §9 | The fail-open `COALESCE(role,'owner')` pattern |
| D9 | Supabase NEW API keys (2026-07-11) | `sb_publishable_` via `lib/supabase/keys.ts` (one resolution point), legacy anon fallback ONLY until legacy keys are disabled post-deploy; Vercel carries the new key. RFQ Hunter standard | Legacy JWT anon/service_role keys |
| D10 | Genesis Kit is the one scaffolder (2026-07-11) | Workspace ADR-003: new projects start by genesis; the workspace template/scaffolder is retired; scaffolding lessons flow upstream to the Kit (propose-then-approve). Consequence: the core in-app Scaffolder page + action (they shelled out to the retired script) are retired with it — nav entry, route, and middleware path removed; files in `docs/__retired/code/` | The workspace template v2 (ADR-002 §3, scaffolding side); the `/scaffolder` dashboard tool |
| D11 | Core runs the fleet's operating system (2026-07-11) | This retrofit: core CLAUDE.md + session-start hook + this decisions log + the ridgeline-core-doc-sync skill + guard hooks (blanket-adds, main-commit, lanes, db-sql, build-vs-dev, doc-sync tripwire) + `docs/__inbox/` lanes + Scheme B naming going forward. Stale taxonomy-era docs retired to untracked `docs/__retired/` for owner review | Core's pre-system shape (no CLAUDE.md, no hook, decisions scattered) |

## Open items / TBD register

- [x] ~~Disable the LEGACY Supabase API keys + remove the fallback~~ — DONE
      2026-07-11: legacy keys disabled in the dashboard, fallback removed
      from `lib/supabase/keys.ts`, prod + local verified on
      `sb_publishable_` alone.
- [ ] Supabase Auth URL configuration for the magic-link redirect — link
      sending is UNTESTED until set (PR #2 checklist).
- [ ] Portal nav overflows below ~900px viewport (theme toggle + sign-out fall
      off-screen) — wrap or collapse; cheap.
- [ ] Activity ingest for real clients: `automation_activity` fills by hand
      today; an authenticated POST endpoint (n8n-shaped) + a small owner CRUD
      for automations/issues/roadmap/highlights must exist before client #1's
      hand-off. The monthly report email (the portal-adoption lever) follows.
- [ ] Real-client prerequisites for the value dashboard: measured
      `baseline_minutes_per_item` per automation + real `blended_labor_rate`
      (the audit produces both). No baseline, no claim.
- [ ] PDF export on documents is a stub (Markdown download works).
- [ ] Client provisioning is a manual runbook (auth user + app_metadata stamp
      by hand) — automate when client count justifies it.
- Pilots (movie-slot-machine, gridstrain): boredom builds, not important
      (owner, 2026-07-11). No backfill owed; nobody re-flags their stub docs.
