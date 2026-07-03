# BUILD PLAN — The Ten Days (2026-07-03 → 2026-07-13)

**Context:** ~10 days of Claude Max remain. Strategy override by owner: build
maximally now, don't defer modules for hypothetical clients. Public layer
first (it pays in all three futures), then dashboard + portal completion over
the weekend, then hygiene. The one-page marketing site goes live FIRST — the
client login does not need to be finished to ship the marketing page.

**How to use this doc:** priority-ordered, top to bottom. Add your notes under
any item on its `> notes:` line — they survive commits and I read them at the
start of every work session (docs/tasks/ also works for bigger handoffs).
Check boxes as things land. This plan supersedes the splash page: we're going
straight to the real page, so DESIGN-BRIEF-splash-page.md becomes optional
(keep or drop at your whim).

Legend: ☐ = planned · effort: S (<1h) / M (half-day) / L (day+)

---

## TIER 0 — Today: the one-pager, correct and honest (all S)

- [x] **0.1 Copy edit — service area.** Everywhere the homepage says
  "Murrells Inlet" (ClientsSection copy), replace the geographic framing with
  **"The Lowcountry to Myrtle Beach and beyond."** Footer/contact stays
  "Myrtle Beach, South Carolina."
  > notes:

- [x] **0.2 Proof section (03 — PROOF) — add the products.** Add three
  entries alongside the existing client stories: **RFQ Hunter**
  (federal-contract intelligence platform, live in private beta),
  **Movie Slot Machine** (movieslotmachine.com — live), **GridStrain**
  (gridstrain.com — live). Products are yours: name them and LINK them —
  clickable proof beats described proof. Client stories keep the
  names-held-back rule. Copy drafts in your voice, you review before push.
  > notes: RFQ Hunter, will have its marketing page live before the weekend is over. For all three portfolio pieces along with the websites, we will create white papers, stories behind each one of them ready to go by the end of the weekend. I have other businesses where I created a business plan the concept behind the brand, and even plans for a marketing website. To my thought is while I have the session time and Claude design can take the prompt that you write and create the website we can make these available too. One is called TidyRipples and it has a really cool story behind it, plus, I have a domain name for it. I also have a website that started out as a book that I'd like to add. You can review the website https://therightbusinessfirst.com/ as this will be a good addition to the portfolio to show that I am versitile. I asked for spinroom.app, we will add just a one page marketing web page to showcase the storyline for what I had planned. And we might open that up to a public get hub. I have an idea for music app that I may never develop and if I don't, I would like to put that on the portfolio piece as well that's called ClaimedFirst. 

  Where details are:
  - /Users/brianboyd/Projects/a/ClaimedFirst/ (app idea)
  - /Users/brianboyd/Projects/a/SpinRoom/  (SpinRoom version 3)
  - /Users/brianboyd/Projects/Spinroom/  (SpinRoom version 2)
  - /Users/brianboyd/Projects/SongLedger/ (SpinRoom version 1)
  - /Users/brianboyd/Projects/therightbusinessfirst/ (version ???)
  - /Users/brianboyd/Projects/trbf-app/ (version ???)
  - /Users/brianboyd/0/_Loho/ (Maybe add at a later date)
  - /Users/brianboyd/0/all-these-doors/ (Maybe add at a later date)
  - /Users/brianboyd/0/hem-storefront/ (Maybe add at a later date)
  - /Users/brianboyd/0/trades-platform/ (Maybe add at a later date)
  - /Users/brianboyd/Documents/Job Search/portfolio/ACME_Mfg-demo/ (Case Study)
  - /Users/brianboyd/Documents/Job Search/portfolio/ArtisticShield-com/ (Case Study)
  - /Users/brianboyd/Documents/Job Search/portfolio/SongLedger-app/ (Case Study)
  - /Users/brianboyd/Documents/Job Search/portfolio/Spinroom-app/ (Case Study)
  - /Users/brianboyd/Documents/Job Search/portfolio/TidyRipples-com/ (Case Study)
  - /Users/brianboyd/Documents/Job Search/portfolio/TRBF-com/ (Case Study)

- [x] **0.3 Wire the contact form for real.** Replace the mock submit
  (Contact.tsx:46 TODO) with a server action sending via **Resend** to
  brian@ridgelineknows.com, plus a honeypot field and a server-side
  min-length check. Keep the existing success card. Until the domain is
  verified in Resend, send from Resend's onboarding domain; swap sender
  after 1.4. Done when: a real test message lands in your inbox.
  > notes: as for the email used for resend, we need to have rules in place to where any project of mine will always use the same email addresses in format. So we need to look at RFQ Hunter to see what it uses. And plus we'll set up resend properly from the beginning, not the on boarding domain, but a real domain. You can build this without us having to test it right away. It can wait until I return.

- [x] **0.4 Logout button.** Dashboard TopBar gets sign-out (portal already
  has one). Done when: you can log out without clearing cookies.
  > notes:

- [x] **0.5 Merge `fix/surface-supabase-query-errors`.** The background
  session's branch is pushed and ready — review, merge, verify build.
  Errors never hide again.
  > notes:

---

## TIER 1 — Today/tonight: make it live (S–M)

- [x] **1.1 SEO / credibility pack.** Create `public/` (favicon, OG image),
  per-page metadata + Open Graph tags, `sitemap.ts`, `robots.ts`, JSON-LD
  LocalBusiness block on the homepage. (M)
  > notes:

- [x] **1.2 Vercel project for core.** Create project `ridgeline-core` (or
  `ridgelineknows`), link repo, set the two env vars
  (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY), first production deploy, verify
  the deploy reflects main HEAD (merged ≠ shipped). (S)
  > notes:

- [ ] **1.3 Auth on the live URL.** Add the Vercel URL (and later the domain)
  to Supabase Auth → URL configuration (site URL + redirect list) so login
  works in production, not just localhost. Smoke: log in on the deployed
  URL. (S)
  > notes:

- [ ] **1.4 DNS cutover.** In Squarespace Domains: point ridgelineknows.com
  A/CNAME records at Vercel (record-level; registrar stays). Add the domain
  in Vercel, wait for cert, verify https://ridgelineknows.com serves the
  marketing page. The Squarespace "Coming Soon" page retires. Also verify
  the domain in **Resend** (SPF/DKIM records — same DNS visit) so the
  contact form sends from @ridgelineknows.com. (M, mostly waiting on DNS)
  > notes:

- [ ] **1.5 Deploy-verify + analytics.** Confirm middleware keeps everything
  but `/` and `/login` gated in prod. Enable Vercel Analytics (free tier)
  so you can see if anyone visits. (S)
  > notes:

---

**Executed while owner away (2026-07-03 evening):** 0.1 done (3 spots, exact
wording; footer/contact = Myrtle Beach). 0.2 done as DRAFT — three linked
product cards live in Stories.tsx, review the copy. 0.3 code complete +
committed; sends soft-fail until RESEND_API_KEY exists (your call — see
DNS-CUTOVER doc §4; bidscovery's key was off-limits by design). 0.4 was
already built (TopBar had sign-out all along). 0.5 merged after review.
1.1 done (icon, OG image, sitemap, robots, JSON-LD, full metadata).
1.2 done — project ridgeline-core created, envs set, production deploy run.
1.3/1.4 = your 10 minutes: docs/plans/DNS-CUTOVER-ridgelineknows.md is
paste-ready. Portfolio sources for Tier 2 inventoried:
docs/plans/PORTFOLIO-INVENTORY.md (note the macOS Documents-folder
permission blocker listed there).

## TIER 2 — Weekend, part 1: the public proof layer (the /work engine) (L)

- [x] **2.1 Migration: public documents.** `is_public` flag on documents +
  anon-read RLS policy (public docs only). Numbered migration via the
  runner, disk + cloud in sync.
  > notes:

- [x] **2.2 `/work` — portfolio index + detail pages.** Public routes.
  Cards from the projects table (portfolio-flagged) + the workspace
  manifests: RFQ Hunter, Movie Slot Machine, GridStrain, Salem (anonymized
  per Stories rule), Ridgeline itself. Each detail page: problem → build →
  outcome, links where live.
  > notes:

- [x] **2.3 `/papers` — white papers.** Public index + MarkdownViewer render
  of public documents. Print CSS so "Download PDF" becomes browser-print
  (kills the stubbed PDF button honestly). 
  > notes: index + render live. Print-CSS pass NOT verified — check before
  promising "print to PDF" anywhere.

- [x] **2.4 Content: first two papers/case studies.**
  (a) **RFQ Hunter story** — raw material: bidscovery docs/planning/RFQ-Hunter-Story.md (adapt, owner approves).
  (b) **Salem case study** — the assessment + proposal already in the DB, anonymized ("a two-person DoD contractor").
  Wire homepage Stories cards → their /work pages.
  > notes: expanded far past "first two" — see execution log below. The RFQ
  Hunter flagship paper (a) shipped 2026-07-03 night: 1,472 words, the
  longest on the site per owner directive, every claim traced to the
  bidscovery runbook (forecast framed as "DLA published forecast", mock-AI
  and preview-only features omitted). Homepage Stories product cards link
  out to the live products and cross-link to /work; per-card /work wiring
  not done.

**Tier 2 content executed 2026-07-03 evening (owner green-light: "push the
drafts, I'll review on the site"):** SEVEN papers live at /papers, in order:
ACME Smart Log ($2.4M reconciliation, stage-named per owner privacy ruling —
Salem never appears), Heart Echoes Music, TidyRipples (family-legacy origin),
TRBF (four phases canon; Orientation is a step, not a phase five), SongLedger,
ArtisticShield, Spinroom. All base64-inserted, md5-verified 7/7 against local
drafts (core/docs/gitignored/drafts/). /work grew 5 → 11 entries: +songledger,
+artisticshield, +spinroom, +tidyripples, +trbf, +claimedfirst;
dod-contractor-platform renamed acme-smart-log. Dead links held back:
alpha.spinroom.app and tidyripples.com did not resolve at check time (owner:
confirm if they should). Three Claude Design prompts committed at
docs/plans/design-prompts/ (tidyripples-site, spinroom-one-pager,
claimedfirst-teaser — the last supersedes the prompt file in
~/Projects/a/ClaimedFirst/). OWNER REVIEW TONIGHT: everything above is live
but unreviewed; flag list in the session summary.

**Owner review round 1 applied 2026-07-03 night:** ACME's 249-discrepancy and
30-second claims pulled (owner could not confirm as real-engagement results);
RFQ Hunter origin line added to the ACME paper. TidyRipples repositioned —
never launched, never operated, now presented as a complete business design
FOR SALE (owner call; fake testimonials permitted on the demo site with
fictional-disclosure small print). TRBF: book-manuscript lineage added,
"Leverage Profile" restored as the framework's own term. All three live paper
rows updated in place, md5-synced to drafts. RFQ Hunter flagship published to
the top of /papers. Design prompts: tidyripples-site.md revised (no city,
for-sale ending, fresh Next.js build); spinroom-platform.md replaces the
one-pager (7-page staged reveal covering all 24 features with honest status
labels; storyline page is the centerpiece). ClaimedFirst prompt unchanged —
owner weighing public-vs-hidden; recommendation delivered.

---

## TIER 3 — Weekend, part 2: dashboard completion (build-everything override) (L)

Order within the tier = most-used-first:

- [x] **3.1 Assessments module** — real list/detail/new (schema exists;
  pattern-match Clients). Findings/recommendations editing feeds the portal
  view that already renders them.
  > notes:
- [x] **3.2 Deliverables module** — list + detail + status transitions
  (pending → delivered drives what clients see).
  > notes:
- [x] **3.3 Documents index** — replace the stub with a real all-documents
  list (search by entity/client) reusing DocumentList; entity-level viewing
  already works.
  > notes:
- [x] **3.4 Billing rates** — finish the stub (CRUD on billing_rates,
  default-rate flag feeding InvoiceForm).
  > notes:
- [x] **3.5 Settings** — minimum honest version: profile (name/email),
  password change, sign-out; plus a "system" card (Supabase project,
  version). Skip preferences until they exist.
  > notes:
- [x] **3.6 Communications — DECIDE, don't default.** Options: (a) drop the
  nav item for now, (b) thin version = log of sent contact-form messages +
  Resend sends. Recommend (a) unless (b) excites you.
  > notes: owner chose (a) 2026-07-03 — "drop it for now." Nav item removed
  from Sidebar same day. Revisit only when Resend goes live.

---

**Tier 3 executed 2026-07-03 night:** 3.1/3.2/3.4 were ALREADY BUILT (real
pages + full action sets — earlier stub labels were wrong). Built fresh:
3.3 documents index (filters, portal/public flags) and 3.5 settings
(password change, sign-out, system info). Sidebar "soon" tags cleared for
both. 3.6 communications still awaits your decision: (a) drop the nav item
or (b) thin sent-mail log. Deployed to production.

## TIER 4 — Weekend, part 3: portal pass (M)

- [x] **4.1 Portal deliverables + documents pages** — finish the two thin
  routes; shared documents already flow via RLS.
  > notes:
- [x] **4.2 Portal polish** — empty states everywhere, contact block reads
  brian@ridgelineknows.com (currently hardcoded info@), invoice detail view.
  > notes:
- [x] **4.3 Client-user provisioning runbook** — documented steps (dashboard
  user + app_metadata role/client_id SQL from migration 20260105 comments)
  so inviting a portal user is a 5-minute procedure. Automation later.
  > notes:

---

**Tier 4 executed 2026-07-03 night:** 4.1 portal deliverables/documents were
ALREADY BUILT. Built: portal invoice detail (line items, RLS-scoped),
info@→hello@ fix, CLIENT-PORTAL-RUNBOOK.md in docs/setup/. Deployed.

## TIER 5 — Next week: hygiene that keeps it honest (M total)

- [ ] **5.1 Zod validation on all server actions** (status enums, UUIDs,
  bounded strings); kill the silent JSON-parse catch in billing.ts.
  > notes:
- [ ] **5.2 Generated DB types** — `supabase gen types` replaces hand-written
  lib/types.ts core; drift becomes impossible.
  > notes:
- [ ] **5.3 Transaction + idempotency** — convertToClientAction atomic;
  proposal transitions guard current status.
  > notes:
- [ ] **5.4 Minimal CI** — GitHub Action: build + lint + tsc on PR (pairs
  with branch-by-default).
  > notes:
- [ ] **5.5 A11y pass** — aria-current on nav, tablist semantics on
  FilterTabs, loading.tsx skeletons on the heavy pages.
  > notes:
- [ ] **5.6 Extract duplicated primitives** — StatCard, Field (used in every
  detail page).
  > notes:

---

## TIER 6 — Stretch (only if days remain)

- [ ] 6.1 Overview follow-ups widget (BACKLOG: follow-up reminders — leads
  table already has follow_up_date)
  > notes:
- [ ] 6.2 Revenue-by-month chart on billing (BACKLOG)
  > notes:
- [ ] 6.3 Proposal win-rate stat (BACKLOG)
  > notes:
- [ ] 6.4 THE NAME section on the site (owner's song as source — ask first;
  see BACKLOG)
  > notes:

---

## Standing rules for the sprint

- Branch-by-default → PR → merge → **verify the deploy reflects main** —
  now real, since production exists after 1.2.
- Every migration: numbered file on disk + applied to cloud + STATUS
  updated same session.
- Copy changes: drafted in Brian's voice, owner reviews before they ship.
- Anything cut for time gets a line here with a reason — no silent drops.

## Explicitly NOT in this plan

Native accounting · time tracking · calendar view · multi-tenant anything ·
PDF generation libraries (print CSS instead) · lead-funnel automation.
They stay on BACKLOG.md until reality demands them.
