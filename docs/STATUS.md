# ridgeline-core — STATUS

Last updated: 2026-07-11. Code is ground truth; this reconciles to it.

## Shipped 2026-07-11 — portal home dashboard (PR #2, feature/portal-home)

The portal home dashboard ("the ten-second screen"), per ADR-100 and
docs/plans/BUILD-PLAN-portal-home-dashboard.md. Visually verified end to end
(both themes, owner preview, requests round trip) before merge:

- `/portal` is now a value dashboard (was a redirect to projects): health
  banner, hours/dollars/issues scoreboard with "How I count this" math
  (30% haircut in `lib/portal/value.ts`), peace-of-mind card, caught & fixed
  log, what's-next roadmap, Request a change.
- New tables (migration `20260711000000_portal_value_layer.sql`): automations,
  automation_activity, caught_issues, roadmap_items, change_requests,
  portal_highlights + `clients.blended_labor_rate`. RLS app_metadata pattern;
  explicit GRANTs. Also fixes the documents client policy (project/client
  entity docs were invisible to clients).
- Written request log: portal `/portal/requests` (client submit + thread) and
  dashboard `/requests` (owner reply + status). First client WRITE in the
  schema — insert policy pairs client_id + created_by to the JWT.
- Magic-link sign-in option (shouldCreateUser: false) + role-aware callback.
- Softened-dark portal theme (portal-scoped tokens, toggle in nav, system
  default, localStorage persist). Marketing/login stay light.
- Owner preview: owners browse the portal labeled, with an explicit client
  picker on home. Demo data: `scripts/seed-portal-demo.sql` ("Demo Client
  (Sample Data)") — paste after the migration; one DELETE removes it.
- Migration runner adopted from RFQ Hunter (the Genesis Kit rule: numbered
  migrations via `npm run migrate`, one-off SQL via
  `node scripts/run-migration.mjs <path>` — never hand-paste SQL). Needs
  DATABASE_URL in .env.local (owner-run on purpose).
- Security hardening applied after a four-agent review (ADR-100 §9):
  deny-by-default roles (explicit `role='owner'` in code + RLS, migration
  20260711100000 stamps existing users), open-redirect guard on the auth
  callback, http(s)-only guard on lead links (`lib/safe-url.ts` + CHECK
  constraints), real SQL counts + `portal_value_raw` aggregate for the
  dashboard numbers, tightened change_requests insert, anon default grants
  revoked.
- OPS state at merge: migrations + demo seed applied via the runner (against
  the RIGHT project — the runner now refuses a DATABASE_URL whose ref differs
  from the app's; that guard exists because of a real wrong-project incident,
  fully reverted); public sign-ups DISABLED in Supabase Auth; Email provider
  ON, signups OFF. Supabase NEW API keys (`sb_publishable_`) everywhere —
  LEGACY keys DISABLED in the dashboard 2026-07-11 and the code fallback
  removed; prod + local verified on the new key alone.
- **Activity ingest + owner portal-data screen shipped later the same day**
  (PR #5, D12): `POST /api/ingest/activity` with a per-client bearer key
  (authorization inside the bounded SECURITY DEFINER `ingest_activity`; no
  service-role key in the app; migration 20260711200000 applied via the
  runner) + `/clients/[id]/portal` (automations CRUD, manual activity, caught
  issues, roadmap, highlights, ingest-key generate/rotate — plaintext once).
  Nav-overflow fix folded in. Ops retrofit (PR #3, D10/D11) and the
  legacy-key removal (PR #4, D9 closed) also landed today.
- **Monthly report email shipped v1** (D13, same day): owner-triggered from
  the portal-data screen, dashboard-identical numbers, Resend REST. Cron
  deferred until the first real care-plan client.
- **Client-lifecycle wave shipped** (D14, same day): public written intake
  (`/intake/[token]`) with measured baselines → assessments; care-plan block
  on proposals; report send log + DARK monthly cron; request notifications
  both directions; invoice pay links → portal Pay button; machine-reported
  issues (`/api/ingest/issue`); lean plan tiers; case-study draft generator.
  Demo script: docs/extras/demo-walkthrough.md.
- **Magic link verified end to end** (2026-07-11): Supabase auth email rides
  Resend SMTP now; link arrived and signed in (same-browser PKCE). The
  email-template edit that activates the browser-independent /auth/confirm
  route stays a BACKLOG owner step.
- **Lifecycle connectors shipped** (D15, same day): assessment→proposal→
  project convert actions, the portal Proposals page with client one-click
  Approve (bounded RPC), request→roadmap checkbox, lifecycle nav order.
  **Standing test gate: `node scripts/test-portal.mjs` — 36 checks, currently
  green** (TEST-PLAN-portal.md).
- **UAT punch list shipped** (PR #22, same day): owner-managed industries
  single-select with inline add (migration 20260711600000), phone masks,
  contact-form portal-login provisioning, the global closed-details ghost
  fix (the phantom section gaps), self-explaining ingest/tier sections,
  hourly removed from Rates (day + fixed only), the deliverables create
  form (the action existed, nothing rendered it), document Edit mode,
  settings form padding.
- Still open (the register in docs/decisions-log.md is the authority):
  the Magic Link template edit (BACKLOG); cron env (`CRON_SECRET`,
  `SUPABASE_SECRET_KEY`) when the first client is flagged for auto-send.

## Pending merge — client-owned value inputs (PR #29, feature/client-value-inputs)

The client sets the numbers their savings math runs on: "Your numbers" form
inside the portal's How-I-count panel (blended hourly rate + minutes-per-task
per automation), through the bounded `set_value_inputs` RPC (D18). Migration
20260712000000 must be applied (`npm run migrate`) before/with the merge;
the suite's new checks skip-with-notice until then.

## Pending merge — field kit v1 (PR #31, feature/field-kit)

Card Drops in the dashboard nav (/prospects, phone-first): quick add,
KML import of the Drop-Ins My Map, visit log with card word, promote to
Lead (D19). BACKLOG.md re-sorted and pruned per owner review 2026-07-11.
Migration 20260712010000 must apply (`npm run migrate`) before the page
loads; new suite checks skip-with-notice until then.

## Shipped (live in production)

- **Domain**: https://www.ridgelineknows.com (apex 308→www; DNS at
  Squarespace, record-level; www is primary in Vercel). Flipped 2026-07-03.
- **Marketing site**: home (hero/proof/stories/contact), /work (9 entries,
  SSG), /papers (7 public papers, DB-driven), SEO (OG image, sitemap,
  robots), icon.
- **Industry landing pages (card words, PR #26)**: the business-card back
  reads `ridgelineknows.com/___` + a handwritten word. 12 one-word SSG
  routes (/vrm /pm /real /trades /home /med /food /boats /shop /mfg /books
  /firms) from one template (lib/landing-data.ts + components/landing/):
  per-industry pains, sample portal-dashboard mock (visible "Sample data"
  chip), reserved-review placeholder (honest, not a fake testimonial),
  contact form with per-industry dropdown + page attribution (lead notes
  "Page:" + email line). Aliases + any-case 308 to canonical; unknown words
  hit the 404 word net; /customer-pulse-check is the generic 13th page.
  ALL 13 verticals carry researched copy (2026-07-11, from the reports in
  `_inbox/research/landing/` — plumbing got its own page + word once its
  report landed; /plumbing no longer redirects to /home). The dashboard
  mock grew the portal's non-marketing proof: health line, since-we-started
  cumulative line, a 2-entry caught-and-fixed log per industry, and one
  in-progress item (the request→shipped loop). Researched angles: trust-account/license angles, speed-to-lead,
  draw/lien-waiver mechanics, unbilled-work leakage, eligibility/denials,
  POS↔books reconciliation, quote-speed, time-capture leakage. Discovery
  kits + software landscapes + guardrails from all 12 reports are banked
  for the assessment templates. Hero puts the industry name at wordmark
  scale (blue italic) above the hook line — the visitor sees THEIR industry
  first. Shop-type aliases: /pools /pest /plumbing /lawn → /home, /builders
  → /trades. Reveal animation has no-JS/reduced-motion fallbacks.
- **/work — 9 entries**: rfq-hunter, gridstrain, movie-slot-machine,
  acme-smart-log (client work; Salem stage-named), heart-echoes-music
  (paused — see below), spinroom, tidyripples (for sale + links its
  business plan), trbf, claimedfirst (hook only; full spec private).
- **/papers — 7, ordered strongest-first, dates hidden** (the created_at
  values only drive sort now — cards show read time, not the untrue
  all-today dates): RFQ Hunter (flagship, 1,472 words) → ACME ($2.4M DoD)
  → SpinRoom → The Right Business First → TidyRipples (case study) → Heart
  Echoes → TidyRipples Business Plan (4,750-word artifact, sits last).
- **Papers pipeline**: documents.is_public + anon-read policy; papers are
  rows in `documents` (entity_type 'project'); drafts of record live in
  docs/gitignored/drafts/ (gitignored — edits there are invisible to git;
  tell Claude when you edit one and it diffs + syncs to the live DB row,
  md5-verified). Stale drafts left as records: paper-songledger.md,
  paper-artisticshield.md, paper-dod-contractor.md — none are published.
- **Dashboard** (owner role): overview, leads, clients, projects, proposals,
  assessments, deliverables, requests, billing (overview/invoices/rates),
  documents index, settings, cleanup. Communications dropped 2026-07-03 (stub
  removed 2026-07-11); Scaffolder retired 2026-07-11 (ADR-003/D10 — it drove
  the retired workspace script; new projects start by Genesis Kit genesis).
- **Client portal**: projects, assessments, deliverables, documents,
  billing + invoice detail — RLS-scoped via app_metadata role/client_id.
  Provisioning: docs/setup/CLIENT-PORTAL-RUNBOOK.md.
- **Contact form**: LIVE — Resend wired (separate free account for
  ridgelineknows.com), sends to `hello@`; verified end-to-end 2026-07-04
  (submit → Resend → Zoho inbox). Also creates an inbound lead in `/leads`
  (best-effort; scoped anon INSERT policy, migration 20260110). Hardened against a deploy-skew silent-hang
  (try/catch/finally + 10s send timeout, commit b3ceec2).
- **CI**: GitHub Actions — tsc + build on push. Pushes to master
  auto-deploy (Vercel git-connected).

## Music-project lineage (so it isn't re-litigated)

SongLedger was the origin. It split two ways and SongLedger the name is
retired publicly: the storefront + ~900-song catalog became **Heart Echoes
Music**; the platform/community became **SpinRoom** (the 24-feature "Music
City"). **ArtisticShield** (public authorship-proof brand) is folded into
SpinRoom as the Trust Office and is never shown separately (owner: "do not
display"). Public brand spelling is **SpinRoom**. Never put SongLedger,
SoundForge, or ArtisticShield on a public page.

## Where things run

- Supabase cloud project RidgelineKnows (`eizoelivnnuukskorrgy`); May data
  restored + md5-verified. Local Docker volume retained as backup.
- Vercel project ridgeline-core (team devegg-9058s-projects).

## Owner's return plan (2026-07-04)

1. Read the rest of the papers/site.
2. **DONE 2026-07-04** — email + Resend wired. Zoho Mail (Forever Free) hosts
   `hello@`; Resend sends from a separate free account for ridgelineknows.com;
   contact form verified end-to-end. Runbook: DNS-CUTOVER §4–§5. Convention
   (from RFQ Hunter): `hello@` = human mailbox/Reply-To; purpose-named senders
   (`contact@`); direct Resend REST.
3. Walkthrough → owner hands Claude a revision list; get the site to
   "good enough for now."
4. Return to RFQ Hunter to ready it, then unhide its marketing site.

## Not done / deferred (see BUILD-PLAN-ten-days.md + BACKLOG.md)

- Heart Echoes Music: paused — owner set it down for RFQ Hunter; will finish
  as a side business later. Status on site reflects this.
- Tier 5 code quality: zod on actions, generated DB types, transaction on
  client conversion, ESLint config, a11y pass, primitive extraction.
- CI housekeeping: bump actions/checkout + setup-node to v5 (Node-20
  deprecation warning) — fold into the Tier 5.5 CI touch-up.
- Print CSS for /papers unverified.
- Design prompts ready to paste into Claude Design (owner hasn't sent yet):
  docs/plans/design-prompts/ — tidyripples-site.md, spinroom-platform.md
  (7-page staged reveal), claimedfirst-teaser.md.

## Standing rules

- Salem is never named publicly — ACME Manufacturing is the stage name.
- Docs/plans are the working authority during the sprint; this file is the
  cold-start summary between sessions.
