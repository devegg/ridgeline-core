# ridgeline-core — Decisions Log & Open Items

> The decisions authority. Locked decisions override contrary prose anywhere
> in the repo; when a doc and this table disagree, the table wins and the doc
> gets aligned. New decisions take the next D# (read the COMMITTED log; never
> reuse a number). Detailed rationale for D1–D9 lives in
> `docs/decisions/ADR-100-portal-value-layer.md`; this table is the index of
> record. Workspace-level decisions live in `../docs/decisions/` (ADR-001..003).

**Last Updated:** 2026-08-22

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
| D27 | A client is only emailed if they can actually get in (2026-08-22) | The four §2.2 notifications resolve the client's **login** address — the one that can sign in, which is not necessarily `clients.email` — and send nothing when there is no login, or when portal access is disabled (D26). Reason: public sign-ups are DISABLED (D5) and `signInWithOtp` runs with `shouldCreateUser: false`, so a portal deep link to someone with no account is a dead end they cannot escape — they click, land on `/login`, request a link, and receive nothing. The outcome is always reported to the owner through `NotifyBanner`, because an email that never left looks exactly like one that did and the usual reason is invisible from the page the owner is standing on. **"Email the client" is a checkbox defaulted ON** (owner): the default covers the normal case, the box exists so a corrected invoice does not mail them twice. Un-sharing a document notifies nobody — announcing a withdrawal is worse than silence. Four emails, not the five the plan listed: "report ready" already ships as the monthly report itself (D13) | Sending to `clients.email` regardless of whether an account exists; a silent skip; an always-send with no owner control |
| D26 | Portal access is revoked by disabling, never deleting (2026-08-22) | `/accounts` revokes with a Supabase Auth ban (`ban_duration`), not `deleteUser`. The account and its sign-in history survive, so "were they cut off, and when" stays answerable after the fact, and the decision is reversible from the same button. **Deleting a login is not offered anywhere in the screen** (owner, 2026-08-22). Two guards on the action: an owner cannot disable their own account, because locking yourself out of the dashboard has no in-app recovery path, and an owner account is refused outright since it is not a portal login. `banned_until` drives the Access column and its behaviour was MEASURED on a throwaway account, not assumed — absent when never banned, a future timestamp while banned (through `listUsers`, not only `updateUserById`), absent again once lifted | A one-click destructive delete, which was the first shape considered and was dropped by the owner |
| D26 | The fee is recurring, not once (2026-09-02) | **Supersedes D21's "charged ONCE on the first year's savings (no `/yr`)".** Year one is **25% of what the system actually saved that month, billed monthly** against a count the client can check — so seasonality never has to be forecast and a self-reported volume never has to be right. At month thirteen the share **stops for good** and is replaced by a flat **$40/month base per client plus a per-automation amount** priced at build time from that automation's own footprint (owner-set 2026-09-02); client-facing surfaces say "from $40" because only the base is fixed. Also settled: a $2,000/yr **qualifying find** (a gate on which jobs are accepted, never a minimum fee, and never published); the first hour free; a twelve-month term whose early exit triggers the buyout; deposits of nothing under two days of build, $500 from two days to about a week, and above that it is the wrong door; buyout = twelve months of maintenance plus the unpaid remainder of the first-year share, which doubles as the early-termination figure; the client is licensed during the term with ownership transferring on buyout or on 30 days' cessation; third-party metered costs pass through at cost. Shipped in #69 (the "How it works" panel, which states no dollar figure — publishing the gate would recreate D21's threshold trap) and #70 (`VisitEstimator` fee rows + `MAINTENANCE_BASE_MONTHLY`). **The printed business card needs no reprint**: it states only "no savings, no fee" — truer under monthly billing — and a 25% ratio, never the word "once". Full model + client-facing terms: ridgeline-workspace `docs/business-dev/SAVINGS-SHARE-MODEL.md` and `COMMERCIAL-TERMS-DRAFT.md` | **D21** (the once-only fee and its `/yr` prohibition). D21's other halves STAND: the on-site figures are estimates, the 25% rate is firm conditional on the counts, the "Rough estimate" tag is permanent, scope growth is a change order, and no dollar amount is ever stored |
| D25 | Vision-model card reading is deferred until a card actually fails (2026-08-22) | Re-opened and CLOSED without building. The 2026-08-21 review scheduled a vision reader on the grounds that it would read "the cards that currently fail" and, more importantly, handwritten job sheets. Neither justification survived contact with the record: no failing card is documented anywhere, `docs/__inbox/completed/handoff-2026-08-21.md` says the in-page camera was used on Brian's phone and OCR'd and saved correctly (with an explicit note not to repeat the untested caveat), and the owner CUT job sheets on 2026-08-22 — that is a service Ridgeline delivers FOR a client, not something its own app needs, so it waits for a client who needs it. Cost was never the real constraint (about 1.5c per card on Claude Opus 5 at ~1,900 image tokens, so a 40-card field day is about 60c); the live tradeoff was D20's privacy posture, and there is no reason to spend it. **Trigger to revisit: cards that actually fail in the field.** Field days start 2026-09-08 — a failure then comes with real failing cards to test against, which is a better starting point than a speculative one | Nothing. **D20 stands unchanged** (local tesseract OCR, $0, nothing leaves the device pre-confirm). This overrides only the BUILD-PLAN's "build it this window" scheduling |
| D24 | Migrations: Claude runs additive, Brian signs off on the rest (2026-08-22) | **Overrides the workspace CLAUDE.md line "owner runs the command (prod writes stay human-gated)" for this repo.** Claude applies ADDITIVE migrations directly via `npm run migrate` — `add column`, a new table, a new index — because they cannot destroy or rewrite existing data. Anything that DROPS, ALTERS A TYPE, or BACKFILLS is written by Claude, then **reviewed and signed off by Brian, and run by Claude after that sign-off** — the gate is his review, not his typing. The runner's project-ref guard still applies, and there is still only one Supabase project, so every apply is a production apply. Rationale: the human gate was costing a round trip on changes that carry no risk of loss, while the changes that DO carry that risk deserve a read rather than a keystroke. The Genesis Kit and the workspace CLAUDE.md still carry the older, stricter wording — porting this is a follow-up | Workspace CLAUDE.md § "DB changes are numbered migrations" (for this repo only) |
| D23 | The framing guide IS the crop (2026-08-21) | Card capture uses an in-page camera (`components/field/CardCamera.tsx`), not `<input capture>` — the OS camera app allows no overlay, so cards came back surrounded by desk. The `<video>` box keeps the stream's intrinsic ratio and the CSS guide width equals `GUIDE_WIDTH`, so the framed rectangle and the cropped pixels are the same region by construction. At 0.9 the safety clamp fires on a 16:9 stream and silently shrinks the crop; 0.86 clears 16:9 and 4:3. Falls back to the plain file input when camera access is refused | Edge detection (OpenCV.js, ~8 MB, fails on glare and dark cards); a manual crop box (fiddly while a prospect watches) |
| D22 | Field screens are copy-controlled against password managers (2026-08-21) | `lib/field/no-autofill.ts` carries per-vendor opt-out attributes for desktop, but on Android the managers run as OS autofill SERVICES and never see them. The control that works on a phone is wording: no `email`/`user`/`login`/`password`/`admin` in a field screen's labels or placeholders unless the input really is that. A placeholder reading "Retyping vendor invoices from email" made LastPass open the vault over the task-name box mid-visit | Relying on `autocomplete="off"` or `data-lpignore` alone |
| D21 | Estimated figures, firm rate (2026-08-21) — **fee half SUPERSEDED by D26** | The on-site dollar figures are estimates — their inputs are verbal approximations, so a 20% error in "how often" moves the total 20%. The 25% rate is firm, conditional on the counts holding, and the fee is charged ONCE on the first year's savings (no `/yr`). The total panel shows cost and fee by default with a permanent "Rough estimate" tag; the recovered figure and the full disclaimer are one tap away. Scope growth is a change order priced together. No dollar amount is ever stored — everything derives on read from `lib/portal/value.ts` | Hiding the fee entirely (withdrawn — the change-order mechanism means an on-site figure never was a commitment to a total); presenting the figures as a quote |
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
      Magic Link email-template edit is DONE as of 2026-08-22 — the deployed
      /auth/confirm route is now what the email points at, so links work from
      ANY browser or email app.
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
- [~] Real-client prerequisites for the value dashboard: measured
      `baseline_minutes_per_item` per automation + real `blended_labor_rate`
      (the audit produces both). No baseline, no claim. **Half answered
      2026-08-22 (#57):** the rate now arrives automatically at conversion,
      blended from the on-site visit. The per-automation baseline still has to
      be set when a build goes live — but the visit's timings are on the
      client's roadmap by then, so it is a read, not a re-measure.
- [x] ~~Confirm `SUPABASE_SECRET_KEY` in Vercel production~~ — CONFIRMED
      2026-08-22. It has been in Vercel Production (and Preview) for 42 days,
      and the key itself authenticates against Supabase Auth admin (verified
      by a read-only `listUsers` probe). This item was STALE, not open — it
      had been carried as an owner step that was already done. Creating a
      client login from the live dashboard is not blocked.
- [x] ~~Magic Link email-template edit (owner, Supabase dashboard)~~ — DONE
      2026-08-22 (owner), saved and tested. The Magic link / OTP template now
      points at `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
      and Site URL is `https://www.ridgelineknows.com`. Sign-in links now work
      from any browser, device, or mail app instead of only the browser that
      requested them. This was the last gate on BUILD-PLAN §2.2. No redirect
      allow-list entry was needed — the template builds the URL against the
      site directly, so it never passes through Supabase's allow-list.
- [ ] PDF export on documents is a stub (Markdown download works).
- [x] ~~Client provisioning is a manual runbook~~ — AUTOMATED 2026-07-11
      (PR #17): the Portal login panel creates the auth user with the
      role/client_id stamp (one login per client, one-time password shown
      once) and changes login emails with dual notification. Runbook stays
      as the fallback/reference.
- Pilots (movie-slot-machine, gridstrain): boredom builds, not important
      (owner, 2026-07-11). No backfill owed; nobody re-flags their stub docs.

- Marketing home page argues from capability, not portfolio (owner,
  2026-08-31). The five service lines from the workspace service catalogue
  replace the generic "what I fix" pains and the "who I work with" industry
  grid. Reason: the portfolio is uneven — client stories are on-message, the
  owner's own products are a mix — and an industry cut invites "do you have a
  case study in *my* industry?" A capability cut does not.
- `/work` and `/papers` are unlinked, not retired (owner, 2026-08-31). Off the
  nav and off the home page; still routable and still in the sitemap. They come
  back once the owner has consistent work to revise them against. OPEN: whether
  they should also come out of `sitemap.ts` in the meantime — unlinked pages in
  a sitemap still get indexed.
- RFQ Hunter is not launching as SaaS (owner, 2026-08-31). It may become his
  sister's platform. On the marketing site it is a portfolio piece, not a
  product: no launch language, no link. This does not change the ~/0/rfqhunter
  repo or its hands-off status.
- "Automatically" is off the tagline (owner, 2026-08-31). It can be read as
  headcount reduction. The business-card line replaces it site-wide. The word
  is still fine when it describes data moving on its own.
- Two doors, sorted by one rule (owner, 2026-08-31). `04 — How it works`
      (free call → paid assessment → proposal → build) stays as-is and is the
      website path. The business card sells a contingency deal. Which one a
      job gets is decided by whether the saving can be named as a number
      before the work starts — countable (encoding audit, unbilled-work sweep,
      most intake, named reconciliation exceptions) goes contingency;
      structural/Salem-shaped goes assessment. They are presented as a menu of
      job shapes, never as a menu of prices.
- The contingency floor is a QUALIFYING FIND, not a minimum fee (owner,
      2026-08-31). Brian only takes the job if the find clears $2,000/year —
      25% of which is his $500 target. Below that he says so and there is no
      bill. Chosen over a $500 minimum fee because a minimum fee contradicts
      "no savings, no fee" and would read as bait.
- The number is agreed by both parties in writing before any build (owner,
      2026-08-31). Non-negotiable; it is what makes a performance fee
      defensible when Brian's own code is doing the counting.
- Code is not handed over until paid in full (owner, 2026-08-31).
- Billing is monthly, on measured actuals (owner, 2026-08-31). 25% of what
      the system actually saved that month, for twelve months. Seasonality
      stops mattering because nothing is extrapolated.
- Year two replaces the percentage with a FLAT monthly maintenance fee per
      running automation (owner delegated the call, 2026-08-31). Not a lower
      percentage: after year one what is sold is hosting and upkeep, whose
      cost is fixed per system, and the owner's own test was that he would not
      want to pay a share of labour nobody is performing. Work added later
      starts its own twelve months at 25%. Amount still TBD.
- Ownership: the client is licensed during the term; ownership transfers on
      buyout or on cessation (owner, 2026-08-31). "Paid in full" therefore
      means the buyout price.
- Recurring replaces the one-time fee (owner, 2026-08-31). The printed
      business card needs NO reprint — it states only "no savings, no fee"
      (truer under monthly billing) and a 25% ratio. The word "once" lives
      only in card-pitch-and-talking-points.md and
      `components/field/VisitEstimator.tsx` (the "My fee — one time" row and
      its note), both of which get rewritten.
- [ ] OPEN — the year-two maintenance amount. Blocks the VisitEstimator
      rewrite: the screen cannot show a fee structure with a hole in it in
      front of a customer. Compute bottom-up from real hosting/support cost.
- [ ] OPEN — the upfront build portion (at what job size, what share) and the
      buyout formula. Both must be stateable in one sentence.
- Full model: ridgeline-workspace `docs/business-dev/SAVINGS-SHARE-MODEL.md`.
- Savings-share model decisions of 2026-08-31/09-02 are consolidated as **D26**
      above. The loose bullets that recorded them as they were made have been
      folded in; the register keeps only what is still open:
- [ ] OPEN — the per-automation maintenance amount is a formula, not a number.
      It gets computed per build from that automation's infrastructure plus a
      share of support. Nothing is blocked on it.
- [ ] OPEN — Vercel Hobby is non-commercial and Supabase free pauses with no
      PITR. Both need to be on paid tiers before any client is hosted; the $40
      base assumes that. Verify against the vendors' current terms.
