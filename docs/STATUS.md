# ridgeline-core — STATUS

Last updated: 2026-08-22. Code is ground truth; this reconciles to it.

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
  Resend SMTP now; link arrived and signed in (same-browser PKCE). **The
  template edit that activates the browser-independent /auth/confirm route
  landed 2026-08-22** — links are no longer bound to the requesting browser.
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
  `CRON_SECRET` when the first client
  is flagged for auto-send. (`SUPABASE_SECRET_KEY` is confirmed present and
  working in Vercel production as of 2026-08-22.)

## Shipped 2026-07-12 — client-owned value inputs (PR #29, feature/client-value-inputs)

The client sets the numbers their savings math runs on: "Your numbers" form
inside the portal's How-I-count panel (blended hourly rate + minutes-per-task
per automation), through the bounded `set_value_inputs` RPC (D18). Migration
20260712000000 must be applied (`npm run migrate`) before/with the merge;
the suite's new checks skip-with-notice until then.

## Shipped 2026-08-22 — client self-service password (PR pending, feature/client-password)

`/portal/account`, BUILD-PLAN §2.4 — the last item in Stage 2. The client's
sign-in address plus a password they can set or change themselves.

- Built the same way as the owner's `SettingsPanel`, not as a new pattern:
  `auth.updateUser` on the browser client, 8-character minimum, repeat to
  confirm. That call acts on whoever is signed in, so it cannot be aimed at
  another account — no admin key, no `client_id` to get wrong (D8 intact).
- **Owner preview is switched off here.** An owner in the portal is previewing
  (D3); the password this would change is theirs, not the client's. The form is
  disabled with a note pointing at the Accounts screen.
- Fixes copy that was ahead of the code: the login-email-change email told
  clients to "set one from your account" and no such screen existed. It links
  to the real page now.
- Suite at **63 checks, green** (4 new, section H) — including an ephemeral
  client setting a password on its own session and signing in with it.

**The urgency this item carried is gone.** The plan called a magic link "the
only recovery path, and somebody has to tell them about it" — true until the
template edit landed the same day. Sign-in links are self-serve on `/login` and
work from any device now, so nobody is stranded. What remained was a client who
WANTS a password having no way to set one.

## Shipped 2026-08-22 — client-facing notification emails (PR pending, feature/client-notifications)

BUILD-PLAN §2.2. Four emails with portal deep links — proposal sent,
deliverable delivered, document shared, invoice issued. Before this the app
sent a client nothing but a reply to a change request.

**Four, not five.** "Report ready" already exists as the monthly report itself
(D13, `portal-report.ts`), so a second notification would be two emails about
one report.

- `lib/portal/notify.ts` is the single place that knows how to talk to a
  client. Soft-fails like `sendNotification` — marking an invoice sent is
  never undone because an email bounced.
- **D27: nobody is emailed a link they cannot open.** The recipient is the
  LOGIN address; with no login, or with access disabled (D26), nothing is
  sent. Public sign-ups are off (D5), so a link to an account-less address is
  a dead end with no self-service way out.
- The outcome is reported to the owner (`NotifyBanner`) via the query string.
  The four actions previously updated a row and returned void, so there was no
  channel to say anything at all.
- "Email the client" checkbox, defaulted ON. Un-sharing a document is silent.
- Two schema facts, found by surveying the database rather than assuming:
  **deliverables have no `client_id`** (they reach a client through
  `project_id`) and **documents have none either** — `clientIdForEntity`
  mirrors the RLS policy across all four entity types, with a suite check that
  fails if a fifth type ever appears.
- Suite at **59 checks, green** (5 new, section G).
- Verified in the real UI against production with a throwaway owner, deleted
  after: the no-login path refused to send and said why; the send path
  reported success, which only happens when Resend accepts. A temporary test
  document was created and deleted; the document set is byte-identical to
  before.

**Still untested by a real client, because there is no real client.** The four
client records are Brian's own, a self-preview record, and two demos — only one
has a portal login at all. The first honest test is the first person who signs
after 2026-09-08.

## Shipped 2026-08-22 — the accounts screen (PR #60, feature/accounts-screen)

`/accounts`, owner-only — BUILD-PLAN §2.3. "Does this client have a login?"
and "have they ever signed in?" needed a SQL query to answer, and revoking
access meant opening the Supabase dashboard.

- A row per client whether or not a login exists. Today that is 4 clients and
  1 login, so "no login" is the state the screen mostly reports.
- **Accounts with no client get their own table.** They can sign in, but RLS
  scopes them to a client that is gone or was never set, so the portal shows
  them nothing — and nothing else in the app surfaces them at all.
- Revoke is a reversible disable, never a delete (D26). Two guards: you
  cannot disable your own account, and an owner account is refused.
- One paginated `listUsers` walk. The three older call sites ask for
  `perPage: 1000` and silently drop anything beyond the first thousand.
- `/accounts` added to `DASHBOARD_PATHS` in `middleware.ts` — a dashboard
  route missing from that regex sits outside the owner gate.
- No migration. `last_sign_in_at`, `banned_until`, `email` and `created_at`
  all ride the Supabase auth user object.
- **Fixed a global that would have broken silently.** `.data-table` stretches
  the first cell's link across the whole row (#47); the rule lifting other
  cells back above that overlay named only `a`, which was true of every table
  that existed when it was written. Every control on this screen is a button,
  so "Disable access" hovered, looked live, and navigated to the client page
  instead. Interactive elements are lifted as a class now.
- Suite at **54 checks, green** (7 new, section F). `banned_until` behaviour
  was measured on a throwaway account rather than assumed.
- Verified against production with a throwaway owner account, deleted after;
  the demo client's login was left exactly as found. No test data written.

**`SUPABASE_SECRET_KEY` is confirmed in Vercel production** (2026-08-22) — it
has been there 42 days and it authenticates. The BACKLOG item was stale. The
Magic Link email-template edit is DONE (owner, 2026-08-22, saved and tested),
which clears the last gate on §2.2.

## Shipped 2026-08-22 — the field-to-client chain, and RFQ Hunter's process (PRs #52–#57)

A 2026-08-21 review read the code against the production database and found the
app was ahead of the business: 4 client records (2 demos, 1 Ridgeline itself),
6 automations all belonging to demos, **one client-role account that signed in
once on 2026-07-11 and never returned**, 88 prospects all `untouched`, and zero
`visit_tasks`. Twelve portal pages, no real user inside them.

The failures were not inside features. They were at every handoff between them,
so a business card walked in the front door and arrived at the portal with every
measured fact dropped on the floor. Stage 1 closes all four breaks
(`docs/plans/BUILD-PLAN-field-to-client-chain.md`; the window ends 2026-09-07
because field days start the 8th).

- **The card survives promotion** (#52). `promoteToLeadAction` copied five
  fields and silently dropped `contact_name`, `email` and `website` — the three
  the card scan exists to capture. `toHttpUrl` in `lib/safe-url.ts` normalizes
  on the way across: `prospects.website` takes a bare domain, `leads.website`
  carries an http(s) CHECK, and copied raw a perfectly good website failed the
  entire promotion.
- **A business shows what it was priced at last time** (#54). `visit_tasks` had
  one writer and no readers. `/visit/[id]` now opens on a collapsed line — when
  it was priced, how many tasks, the annual cost — expanding to the per-task
  figures, all through `visitTotals`/`annualCost` so a June quote and a
  September re-read cannot disagree. It reads the most recent visit that
  actually PRICED something, not the most recent visit, so a bare touchpoint
  cannot hide a real estimate. Caught a live cascade bug: the global
  `section { padding: clamp(72px, 11vw, 140px) }` from the marketing site
  applies to every `<section>` in the app, so the new panel first rendered as a
  212px box holding one line of text.
- **The recap email** (#55). One button sends the owner a forwardable write-up
  of what was worked out on site. It goes to Brian, never to the prospect
  (owner decision) — a human looks at an OCR'd address first. It quotes only
  the two figures D21 puts on the phone by default; `npm run test:recap`
  asserts the recovered figure never appears and that no internal word leaks.
- **Follow-up dates on prospects** (#56, migration `20260822000000` applied).
  `leads` had `follow_up_date` since January; prospects had nothing, so a good
  drop-in not promoted the same day had nothing chasing it. Three chips (a
  week / two weeks / a month), not a date picker, because this is tapped
  one-handed in a parking lot. The Overview panel merges both sources, tagged
  Lead or Card drop.
- **Conversion carries the visit** (#57). Lead → client set the default $45/hr
  and nothing else. It now sets `blended_labor_rate` from the visit — weighted
  by annual minutes, so one rare $34/hr task cannot drag up a shop whose real
  cost of labour is $28 — and seeds the roadmap with the priced tasks.
  **Deliberately roadmap items, not automations:** `automations.status` is
  running/issue/paused with no "planned", so a row written at conversion would
  show a client work as live that has not been built. Nothing is overwritten,
  and a failure never fails the conversion.

**Process ported from RFQ Hunter** (#53), after the owner pointed out that
several sessions of asking had only produced piecemeal copying:

- `block-main-push.sh` — core gated COMMITS to the default branch and nothing
  gated the PUSH. Named as a target on 2026-08-19 and never done. It handles
  main and master unchanged; only the denial message needed rewording.
- `block-main-push.test.mjs` — 15 cases. RFQ Hunter's hooks ship with tests;
  core's five had none. It proves the worktree cases specifically:
  `git -C <path> push` and `cd <path> && git push` at a checkout on master are
  denied, feature-branch pushes are not. **The hook always exits 0 and signals
  denial as JSON on stdout** — reading the exit code reports every case as
  allowed, which is how a first pass wrongly concluded the guard was dead.
- **The signature gate.** CLAUDE.md said "act on every file in `docs/__inbox/`
  ROOT", the direct opposite of the workspace rule. Now written out with the
  owner's reason: it is a SCHEDULING gate. A doc can describe work there is not
  enough session time to finish properly, so a signature means "there is room
  to do this right", not merely "this is a good idea".
- **`docs/PR-NOTES.md` + `scripts/gen-pr-notes.mjs`** (`npm run pr-notes`). The
  workspace's `snapshot.sh` already looked for this exact filename; core never
  had it, so every claude.ai snapshot shipped with no PR history — it warned
  and carried on, which is why nobody noticed. Step 0 of the doc-sync pass now
  regenerates it. It reads GitHub, so it cannot drift.
- **D24** — Claude applies additive migrations; anything that drops, alters a
  type or backfills is written by Claude, reviewed and signed off by Brian, and
  then run by Claude. The gate is his review, not his typing.

Merge note: #54–#57 landed as merge commits rather than squashes. Each branch
in the stack carried the previous ones, and squashing the first made every
follower conflict against a master that held the same changes under a new SHA.

## Shipped 2026-08-21 — field kit, hardened by a real field run (PRs #41–#50)

The estimator (#40) met an actual drop-in. Everything below came from Brian
using it on his phone, in front of people, and is recorded because most of it
was invisible from a desk.

**The phone path** — `/visit` (PR #41): a full-bleed field home with a real
camera button, client-side search over the working list, and a tap into the
estimator. Built because `/prospects` is unusable on a phone: the dashboard
layout has a fixed 220px sidebar and no mobile collapse (~170px of content at
390px). Desktop `/prospects` is untouched apart from a link across.

**Card capture, made to actually work:**
- Saving a scanned card crashed with a bare "client-side exception" and saved
  nothing. Next caps Server Action bodies at 1 MB by default and that was
  never raised, so a 3–6 MB camera photo was rejected before the action ran
  (#43). Photos are now downscaled in the browser first
  (`lib/field/downscale.ts`), the limit is 12 MB as a backstop, and
  `app/(field)/error.tsx` replaces the bare crash screen.
- `<input capture>` hands off to the phone's camera app, where no framing
  guide can be drawn, so cards arrived surrounded by desk. `CardCamera`
  (#48) owns the preview: the guide rectangle and the crop are the same
  region by construction. `GUIDE_WIDTH` and the CSS width must stay equal —
  at 0.9 the clamp fires on a 16:9 stream and silently shrinks the crop.
- Scanning a card now opens that business's visit screen (#47), like the
  manual add already did.
- A business already promoted to a Lead was filtered out of the "attach to"
  picker, so re-scanning its card failed with advice that could not be
  followed (#49). Attach targets now come from their own unfiltered query.
- Failed saves used to strand the uploaded photo in storage; every failure
  path now drops it (#50).

**Honesty and copy:**
- The fee is charged once on the first year's savings. The row said `/yr`,
  which read as recurring — wrong in the client's disfavour (#47).
- The estimate panel took ~40% of the phone screen. Collapsed to two rows,
  cost and fee, with the recovered figure and the full disclaimer one tap
  away; the "Rough estimate" tag never hides (#44, D21).
- LastPass opened over the task-name field. The placeholder contained the
  word "email" — password managers classify by surrounding words, and on
  Android they run as OS autofill services where `data-lpignore` is never
  seen (#42, #45). `lib/field/no-autofill.ts` carries both halves: the
  desktop attributes and the copy rule.

**Lead pipeline** (#47): whole rows are clickable (`cursor: pointer` had been
promising that while only the first cell was a link — fixes every dashboard
table); "Move to Meeting Scheduled" books a date into `follow_up_date`; and
every stage is reachable from a Set stage control, because a stage moved by
accident used to be a dead end for anything but a lost lead.

**Dark mode** (#50): `body { color: var(--ink) }` resolves at `body`, where
`--ink` is still the light value — the dark tokens are scoped to a
descendant. `.portal-layout` and `.dash-layout` set a background but no
colour, so anything without its own colour inherited dark ink onto dark. One
declaration per themed container. Verified on the live invoice: inheriting
cells went from ~26 to 225 luminance against a background of 30.

**ESLint** (#40, #46): flat config added (`eslint.config.mjs`), `npm run lint`
is the ESLint CLI now that `next lint` is deprecated, and the build gates on
it again after the seven pre-existing errors were cleared. Note the
`@next/next` rules double-report when run from a worktree nested under the
main checkout — they walk candidate page roots and find two `app/` dirs.

Also added `npm run test:estimate` (19 checks, math + database) and
`allowImportingTsExtensions` so the suite imports the real `.ts` modules
through node's type stripper rather than duplicating the math.

## Shipped 2026-08-21 — on-site visit estimator (PR #40, feature/visit-estimator)

`/visit/[id]`, a phone-first screen for pricing a prospect's repetitive tasks
out loud during a drop-in while the owner watches the annual figure build.
Per docs/plans/DESIGN-BRIEF-visit-estimator.md (six locked decisions) and
BUILD-PLAN-visit-estimator.md.

- New `(field)` route group with its own full-bleed layout — the dashboard's
  fixed 220px sidebar has no mobile collapse, leaving ~170px of content at
  390px. Same owner-only auth gate, duplicated rather than shared.
- `visit_tasks` (migration 20260820000000, applied): label, who, minutes each,
  times per week, hourly rate. CHECK bounds mirror `set_value_inputs`
  ($5–$500/hr, 0.5–480 min). Owner-only RLS, no client policies (D8). **No
  dollar amounts stored** — money is derived on read.
- `lib/field/estimate.ts` imports `HAIRCUT` and `formatDollars` from
  `lib/portal/value.ts`; a test asserts it IS the portal's constant, so the
  field number and the portal number cannot drift.
- Three money lines: costs now, recovered after the 30% haircut, and the 25%
  fee — with a permanent "Rough estimate" tag and a note separating the
  estimated figures from the firm rate (D21).
- `saveVisitEstimateAction` writes a visit plus its tasks all-or-nothing
  (deletes the visit if the tasks fail) and never walks a status backward.
- `scripts/test-estimate.mjs` (`npm run test:estimate`) — 19 checks, math and
  database. Imports the real `.ts` modules via node's `--experimental-strip-types`.
- ESLint 9 flat config added (`eslint.config.mjs`); `npm run lint` is the
  ESLint CLI now that `next lint` is deprecated. **Build gating deliberately
  off** (`eslint.ignoreDuringBuilds`) — 11 pre-existing errors in shipped
  files would fail production deploys the moment the config landed.
- Verified end to end at 390px against a real prospect: no horizontal
  overflow, no sidebar, sticky total, ~$5,800 / ~$4,100 / ~$1,000 on the
  worked example, two tasks summing to ~$7,800, a real save that flipped the
  prospect to `interested`. Test data removed and the prospect restored.

## Shipped 2026-07-12 — field kit v1 (PR #31, feature/field-kit)

Card Drops in the dashboard nav (/prospects, phone-first): quick add,
KML import of the Drop-Ins My Map, visit log with card word, promote to
Lead (D19). BACKLOG.md re-sorted and pruned per owner review 2026-07-11.
Migration 20260712010000 must apply (`npm run migrate`) before the page
loads; new suite checks skip-with-notice until then.

## Shipped 2026-07-12 — dashboard dark mode (PR #32, feature/dashboard-dark)

The portal's softened-dark theme now also covers the owner dashboard
(owner request 2026-07-12, screen fatigue): toggle in the sidebar footer,
own storage key (rk-dash-theme), pre-paint script, same warm-dark tokens
scoped to .dash-layout. Extends D6's portal-only scope by owner request;
marketing + login stay light.

## Shipped 2026-07-12 — overnight backlog batch (PRs #34–#39)

Business-card scan (photo → in-browser OCR → confirm → private bucket +
prospect, D20) · Follow-ups-due on Overview · /templates (5 house emails)
· document Print/PDF (dead button fixed) · referral field + proposal win
rate + content sweep · meeting notes on client detail. Lead-funnel finish
found already built. Migrations 20260712020000 + 20260712030000 applied;
suite at 47 checks, green against production.

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
