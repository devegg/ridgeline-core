# Ridgeline — Feature Backlog

Items spotted during development and testing. Owner-reviewed. Not prioritized — order here does not imply build order.

---

## Scaffolder

- [ ] **Connect scaffold to a project** — when running the scaffolder from the UI, ask which Ridgeline project record (if any) this new folder structure should be linked to. Auto-populate the project's name, client, and start date into the scaffolded README.

---

## Projects

- [ ] **In-app Markdown viewer** — view `.md` files from a project's folder structure directly in the UI without opening VS Code, MacDown, etc. Read file contents server-side and render as formatted HTML. Useful for specs, README files, ADRs, and feature docs.

---

## Billing

- [ ] **Milestone & deliverable billing / native accounting** — attach dollar amounts to milestones and deliverables; auto-draft an invoice when a milestone is completed or a deliverable is accepted, queued for owner review before sending. Accounting stays native to Ridgeline — no FreshBooks, Harvest, or QuickBooks. Open questions: where does `amount` live (milestone vs. deliverable vs. both); what event triggers the draft; whether one invoice can pull from multiple milestones/deliverables; payment tracking and cash flow reporting downstream.

- [ ] **Invoice PDF export** — generate a downloadable PDF from an invoice so clients can save or print it. Options: `@react-pdf/renderer` for server-rendered PDF, or headless browser (Puppeteer) for pixel-perfect layout. Client portal download button would pull the generated PDF.

- [ ] **Markdown document PDF export** — the "Download PDF" button on document viewer pages is currently stubbed. Convert rendered Markdown HTML to a PDF. Use the same brand typography (Newsreader, IBM Plex Sans) so the PDF matches the portal aesthetic. Options: `@react-pdf/renderer` with custom renderers for each Markdown element, or Puppeteer screenshotting the rendered page.

- [ ] **Time tracking** — log hours against a project directly in the app. Manual entry with date, hours, description, and billable/non-billable flag. Feeds into invoice line item generation so you can build an invoice from logged time instead of entering it manually.

---

## CRM & Lead Management

- [ ] **Leads / Lead funnel** — a pre-client pipeline separate from the Clients section. Stages: Identified → Contacted → Meeting Scheduled → Proposal Sent → Won / Lost. Winning a lead converts it to a Client record automatically. Losing one archives it with a reason.

- [ ] **Leads admin screen polish** — owner idea 2026-07-04 (deferred, specifics TBD). The website contact form now writes inbound leads straight into `/leads` (source=inbound, stage=identified), so this is the screen that surfaces new submissions — worth a pass when higher-priority work clears.

- [ ] **Networking contacts — card drops** — a lightweight record for businesses you've visited or left a card at. Fields: business name, address, type of business, date of visit, notes. Not a full client record — just a touchpoint log that can be promoted to a Lead when there's interest.

- [x] **Extended contact details** ✅ Built — Contacts table includes LinkedIn, X, Facebook, Instagram, website. Multiple contacts per client, each with a role (Owner, Project Contact, Billing, Technical, Other) and portal user flag.

- [ ] **Follow-up reminders** — attach a follow-up date and note to any Client, Lead, or Proposal. A "Follow-ups due" list on the Overview dashboard surfaces what needs attention today or this week.

- [ ] **Referral tracking** — record who referred a client or lead. Useful for understanding which relationships and industries generate the most work, and for knowing who to thank.

---

## Data Management

- [ ] **Owner-only delete/cleanup tool** ✅ Built — dedicated page at `/cleanup`. Records flagged `scheduled_delete` across all sections. Owner reviews and confirms permanent deletion.

---

## Reporting & Visibility

- [ ] **Revenue by month chart** — a simple bar or line chart on the billing overview showing invoiced and paid amounts by month. Built with Recharts (already in the tech stack).

- [ ] **Proposal win rate** — on the Proposals overview, show total sent, total accepted, and win rate percentage. Simple but useful for spotting trends.

- [ ] **Calendar view** — a monthly calendar showing assessment dates, project milestones, invoice due dates, and follow-ups in one place. Useful for spotting conflicts and planning the month.

---

## Communications

- [ ] **Email templates** — pre-written templates for common scenarios: proposal follow-up, assessment scheduling confirmation, invoice reminder, project completion. Fill in client name and project details, then copy to your email client.

- [ ] **Meeting notes** — attach freeform notes to a client or project with a date stamp. Different from relationship notes (which are evergreen) — meeting notes are a running log with timestamps.

---

## Mobile & Field Use

- [ ] **Mobile-optimized views** — the dashboard is desktop-first. Key pages (client detail, quick note, lead entry) should work cleanly on a phone for use in the field.

- [ ] **Quick capture** — a fast-entry form accessible from anywhere in the dashboard: add a lead, log a note, or set a follow-up in under 10 seconds without navigating through the full UI.

---

## Notes

- Items marked ✅ Built are complete and can be removed at next backlog review.
- Items are added here as they are spotted — not all will be built.
- When an item moves into active development, remove it from here and track it in the session task list.
- Last updated: 2026-07-04

## Email / Ops (owner steps, post-Max-plan — added 2026-07-11)

- [x] ~~**Supabase auth email → Resend SMTP**~~ — DONE 2026-07-11 (steps 1–2
  wired, send + sign-in verified). Step 3 below is the one piece still open: (kills the 2-emails/hour limit on
  magic links + fixes deliverability; needed before any real client signs in
  by link). Steps:
  1. resend.com → API Keys → Create API key (`supabase-auth`, Sending access) → copy.
  2. Supabase Dashboard → RidgelineKnows → Authentication → Emails → SMTP
     Settings → enable Custom SMTP: sender `hello@ridgelineknows.com`, name
     `Ridgeline Knows`, host `smtp.resend.com`, port `465`, username `resend`,
     password = the API key → Save.
  3. Supabase → Authentication → Email Templates → Magic Link: replace the
     ConfirmationURL anchor with
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
     so links work from ANY browser or email app (the /auth/confirm route is
     already deployed; without this template edit, links only work in the
     browser that requested them).
  4. Test: login page → "Get a sign-in link by email" → link arrives, click →
     lands signed in on /overview. Then strike the magic-link register item in
     docs/decisions-log.md.

- [ ] **Google Workspace migration** (owner decision 2026-07-11: familiarity +
  field-day email volume justify $8/mo once paying work lands, expected 1–2
  months). Checklist:
  1. Sign up Google Workspace Business Starter for ridgelineknows.com; create
     users `brian@` (primary) and `hello@` (user or alias — alias is $0).
  2. DNS (Squarespace, record-level): swap Zoho MX records for Google's;
     KEEP every Resend record (SPF/DKIM on its subdomain) — Resend stays the
     app's outbound sender (contact form, monthly reports, Supabase auth
     SMTP); Workspace is human mail only.
  3. Verify mail flow both addresses; retire the Zoho org after a safe overlap.
  4. Update nothing in the app — it sends via Resend and receives nothing.

## Site Content

- [ ] **Location reframe across all site copy** — base location is Myrtle Beach (not Murrells Inlet; owner correction 2026-07-03). Reword geographic positioning site-wide to "the South Carolina coast — from the Lowcountry to Myrtle Beach." Applies to WHO I WORK WITH, contact, footer, and the content draft in docs/extras/content/. The splash-page brief (docs/plans/DESIGN-BRIEF-splash-page.md) already reflects it.

- [ ] **Service-area framing** — copy should say: based in Myrtle Beach, in-person along the SC coast, and clients anywhere (remote beyond the coast; occasional in-person preferred when it can be arranged). Note for all brand work: the "Ridgeline" mountain imagery is the vantage-point metaphor — seeing a business's whole terrain — not a geography claim. Keep it, coast or no coast.

- [ ] **THE NAME section rewrite** — Brian has personal source material for what the name means (one of his songs: permanence over riches, the morning ridgeline as the whole dream, building something nobody handed him). Ask him before drawing on it — the lyrics are Heart Echoes Music material and stay his. Even one grounded line beats a page of positioning copy.

## Email — DONE 2026-07-04 (was deferred 2026-07-03)

- [x] **Resend setup for ridgelineknows.com** ✅ Built 2026-07-04 — separate free Resend account (RFQ Hunter holds the other account's one free domain), domain verified, `RESEND_API_KEY` in Vercel (Preview+Production); contact form sends end-to-end. Details: docs/plans/DNS-CUTOVER-ridgelineknows.md §4.
- [x] **hello@ridgelineknows.com mailbox** ✅ Built 2026-07-04 — Zoho Mail (Forever Free); receiving confirmed. Sole human address (owner chose no `brian@` alias). Details: docs/plans/DNS-CUTOVER-ridgelineknows.md §5.
