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
| D20 | Card scans are guesses until a human says otherwise (2026-07-12) | Business-card capture: photo picked/snapped on the phone, OCR'd IN THE BROWSER (tesseract.js — $0, nothing leaves the device pre-confirm), heuristic field extraction (lib/card-parse.ts), then an editable confirm form; save uploads the photo to the private owner-only `cards` bucket and creates a prospect or fills the blanks on an existing one (photo always wins, text never overwrites). Migration 20260712020000 | Auto-saving OCR output; a paid OCR API |
| D19 | Field kit v1 — prospects are not leads (2026-07-12) | Card drops get their own owner-only touchpoint log (`prospects` + `prospect_visits`, migration 20260712010000; RLS has no client policies at all): business, industry, visits with date + which card word was handwritten, notes. His "Grand Strand Drop-Ins" Google My Map imports via KML (layers → industries; dedupe index makes re-imports idempotent; KMZ politely refused with the fix). Promote-to-lead creates a `leads` row (source card_drop) and links back — a prospect never becomes a client without passing through the funnel | Stuffing drive-by touchpoints into `leads` (which would bury the real funnel) |
| D18 | The client owns the savings inputs (2026-07-12) | The honest-math number is unarguable when its inputs are the client's: a "Your numbers" form inside the portal's How-I-count panel lets the client set their blended hourly rate ($5–$500) and each automation's minutes-per-task baseline (0.5–480), via the bounded SECURITY DEFINER `set_value_inputs` (client role + own tenant enforced in-DB; migration 20260712000000; no RLS loosening). The 30% haircut still applies on top. Suite checks skip-with-notice until the migration is applied. Owner preview shows the form read-only | The rate as an owner-only (effectively hard-coded default-45) value |
| D17 | Card words serve pages, never redirects (2026-07-11) | The card back is `ridgelineknows.com/___` + a handwritten word; every word is its own SSG page from one template (lib/landing-data.ts) because per-word analytics and SEO are the point — a redirect to one generic page would erase both. Aliases and any-case 308 to the canonical word; unknown words land on the 404 word net; `/customer-pulse-check` is the generic 13th page. Proof slots stay honest: dashboard mocks carry a visible "Sample data" chip and the review slot is an openly reserved placeholder — the disclosure lives in the attribution line itself, not a footnote (FTC review rule + the brand's own no-exaggeration promise) | The words-redirect-to-one-page plan; invented reviews with a footnote |
| D16 | Rates carry no hourly option (2026-07-11) | The rates UI offers Daily and Fixed only (owner: "we should not have hourly rates" — value/scope set the price, the day rate is the floor). The DB check keeps 'hourly' valid for any legacy rows; the UI never creates new ones. Industries became an owner-managed list (migration 20260711600000) the same pass | Hourly as a first-class rate type |
| D15 | Lifecycle connectors + the standing test gate (2026-07-11) | The assessment→proposal→project thread is explicit: `proposals.assessment_id`, "Draft proposal from this" (pre-fills scope from recommendations + the default Care Plan), "Create project" on approved proposals (links back). Clients approve pending proposals in the portal via the bounded SECURITY DEFINER `approve_proposal` (their client + pending only; owner notified). Requests: "add to roadmap as shipped" checkbox on Done. Portal nav reads in lifecycle order. **`node scripts/test-portal.mjs` (36 checks: public surface, RPC hardening, tenant isolation incl. forgery/cross-tenant, ingest round trip, stress burst) is the standing pre-walkthrough gate — 0 failures required** (docs/plans/TEST-PLAN-portal.md) | Unlinked modules; manual-only verification |
| D14 | Client-lifecycle wave (2026-07-11) | Digitized written intake (public `/intake/[token]` page; single-use token verified inside the bounded SECURITY DEFINER `submit_intake`; answers + measured baselines land on the assessment) · care-plan block on proposals (opt-out, three tiers, jsonb) · report send log + a DARK monthly cron (`/api/cron/monthly-reports`, CRON_SECRET-gated, sends only to `report_auto_send=true` clients — default false — and 501s until `SUPABASE_SECRET_KEY` exists; the admin client is used by this one route only) · request notifications both directions (Resend, soft-fail) · `invoices.pay_link` → portal Pay button (https-only CHECK) · `ingest_issue` (machines file caught-issues with the same bearer key) · lean tiers (`clients.plan_tier` watch/improve/own: SLA line + one calm locked row, no separate dashboards) · case-study draft generator (anonymized descriptor, rounded figures, [TBD] markers, saved unshared to Documents). Migration 20260711300000; demo script docs/extras/demo-walkthrough.md | The "later, when triggers fire" posture for these nine — owner pulled them forward as a portfolio-complete demo (fictitious client, clearly labeled) |
| D13 | Monthly report is owner-triggered v1, cron-deferred (2026-07-11) | One data model, three views (D1): the report renders the dashboard's exact numbers (`lib/portal/report.ts` — narrative first, cards, caught & fixed, what's next, portal deep-link, the how-I-count footer). Sent via Resend REST (`reports@` sender, `hello@` Reply-To, house convention). A scheduled monthly send is deferred until the first real care-plan client | A cron built before any client exists to receive it |
| D12 | Machine ingest authorizes inside the database (2026-07-11) | Per-client bearer key (sha256 hash on `clients`), verified by the bounded SECURITY DEFINER `ingest_activity()` that can touch nothing but one `automation_activity` row; the app keeps NO service-role key. Key plaintext shown once at generate/rotate. Migration 20260711200000; PR #5 | A service-role/API-secret client in the app layer |
| D11 | Core runs the fleet's operating system (2026-07-11) | This retrofit: core CLAUDE.md + session-start hook + this decisions log + the ridgeline-core-doc-sync skill + guard hooks (blanket-adds, main-commit, lanes, db-sql, build-vs-dev, doc-sync tripwire) + `docs/__inbox/` lanes + Scheme B naming going forward. Stale taxonomy-era docs retired to untracked `docs/__retired/` for owner review | Core's pre-system shape (no CLAUDE.md, no hook, decisions scattered) |

## Open items / TBD register

- [x] ~~Disable the LEGACY Supabase API keys + remove the fallback~~ — DONE
      2026-07-11: legacy keys disabled in the dashboard, fallback removed
      from `lib/supabase/keys.ts`, prod + local verified on
      `sb_publishable_` alone.
- [x] ~~Magic-link send test~~ — VERIFIED end to end 2026-07-11 (owner):
      SMTP-via-Resend wired, link arrived, same-browser click signed in as
      designed (PKCE binds a link to the requesting browser). The BACKLOG's
      Magic Link email-template edit remains open — it activates the deployed
      /auth/confirm route so links work from ANY browser or email app.
- [x] ~~Portal nav overflow below ~900px~~ — DONE 2026-07-11 (PR #5): nav wraps.
- [x] ~~Activity ingest for real clients~~ — DONE 2026-07-11 (PR #5, D12):
      `POST /api/ingest/activity` (per-client bearer key, authorization inside
      the bounded SECURITY DEFINER `ingest_activity`, sha256 hash on clients,
      no service-role key in the app) + the owner portal-data screen
      (`/clients/[id]/portal`: automations, manual activity, issues, roadmap,
      highlights, ingest-key rotate). Round trip verified incl. 401 paths.
- [x] ~~Monthly report email~~ — SHIPPED v1 2026-07-11 (D13): owner-triggered
      send from `/clients/[id]/portal` (month picker, editable recipient);
      same numbers as the dashboard via `lib/portal/report.ts`; Resend REST,
      sender `reports@`, Reply-To `hello@`. CRON DEFERRED deliberately —
      trigger: the first real care-plan client (register this when it fires).
- [ ] Real-client prerequisites for the value dashboard: measured
      `baseline_minutes_per_item` per automation + real `blended_labor_rate`
      (the audit produces both). No baseline, no claim.
- [ ] PDF export on documents is a stub (Markdown download works).
- [x] ~~Client provisioning is a manual runbook~~ — AUTOMATED 2026-07-11
      (PR #17): the Portal login panel creates the auth user with the
      role/client_id stamp (one login per client, one-time password shown
      once) and changes login emails with dual notification. Runbook stays
      as the fallback/reference.
- Pilots (movie-slot-machine, gridstrain): boredom builds, not important
      (owner, 2026-07-11). No backfill owed; nobody re-flags their stub docs.
