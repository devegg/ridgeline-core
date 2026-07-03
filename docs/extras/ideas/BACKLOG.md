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
- Last updated: May 2026

## Site Content

- [ ] **Location reframe across all site copy** — base location is Myrtle Beach (not Murrells Inlet; owner correction 2026-07-03). Reword geographic positioning site-wide to "the South Carolina coast — from the Lowcountry to Myrtle Beach." Applies to WHO I WORK WITH, contact, footer, and the content draft in docs/extras/content/. The splash-page brief (docs/plans/DESIGN-BRIEF-splash-page.md) already reflects it.

- [ ] **Service-area framing** — copy should say: based in Myrtle Beach, in-person along the SC coast, and clients anywhere (remote beyond the coast; occasional in-person preferred when it can be arranged). Note for all brand work: the "Ridgeline" mountain imagery is the vantage-point metaphor — seeing a business's whole terrain — not a geography claim. Keep it, coast or no coast.

- [ ] **THE NAME section rewrite** — Brian has personal source material for what the name means (one of his songs: permanence over riches, the morning ridgeline as the whole dream, building something nobody handed him). Ask him before drawing on it — the lyrics are Heart Echoes Music material and stay his. Even one grounded line beats a page of positioning copy.

## Email (deferred 2026-07-03 — owner: "I need to set up an email account and I don't want to do that right now")

- [ ] **Resend setup for ridgelineknows.com** — add domain in Resend, DNS records (DKIM/SPF), mint a sending-access key, put it in core/.env.local + `vercel env add RESEND_API_KEY production`. Until then the contact form soft-fails with a polite message. Steps: docs/plans/DNS-CUTOVER-ridgelineknows.md §4.
- [ ] **hello@ridgelineknows.com mailbox** — create or forward (Squarespace email forwarding is the free 2-minute version). NOTE while deferred: every mailto on the site and the form's fallback message point at hello@ — until the mailbox exists, a visitor who emails it gets a bounce. Matters from the moment the domain flips.
