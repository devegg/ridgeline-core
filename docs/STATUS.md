# ridgeline-core — STATUS

Last updated: 2026-07-11. Code is ground truth; this reconciles to it.

## In review — feature/portal-home (PR open, NOT yet merged/deployed)

The portal home dashboard ("the ten-second screen"), per ADR-100 and
docs/plans/BUILD-PLAN-portal-home-dashboard.md:

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
- OPS to confirm on merge: `npm run migrate` + demo seed applied via the
  runner; Supabase Auth URL configuration allows the /auth/callback redirect
  for magic links; production deploy reflects master HEAD.

## Shipped (live in production)

- **Domain**: https://www.ridgelineknows.com (apex 308→www; DNS at
  Squarespace, record-level; www is primary in Vercel). Flipped 2026-07-03.
- **Marketing site**: home (hero/proof/stories/contact), /work (9 entries,
  SSG), /papers (7 public papers, DB-driven), SEO (OG image, sitemap,
  robots), icon.
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
  assessments, deliverables, billing (overview/invoices/rates), documents
  index, settings, scaffolder, cleanup. Communications dropped 2026-07-03.
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
