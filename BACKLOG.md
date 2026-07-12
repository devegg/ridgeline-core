# Ridgeline — Feature Backlog

Sorted 2026-07-11 (owner-reviewed sort): ordered by what makes sense next,
with field days as the lens. Autonomy tags: [solo] Claude builds without
input · [input] needs an owner decision first · [owner] owner-only step.

Deleted this pass (owner call, 2026-07-11): scaffold-to-project linking
(Scaffolder retired, D10), time tracking as billing feed (hourly is dead,
D16 — see future note below), location reframe (shipped with the landing
pages; only the content-drafts sweep remained and moved below).

---

## Now — the field kit (in progress 2026-07-11, feature/field-kit)

- [ ] **Networking contacts — card drops** [solo] — prospects log: business,
  industry, address, visits with date + which card word was handwritten,
  notes. Imports the "Grand Strand Drop-Ins" Google My Map (KML export).
  Promote a warm prospect to a Lead (source: card drop) in one click.
- [ ] **Quick capture** [solo] — logging a drop from the phone in the parking
  lot in under 10 seconds. V1 lives on the prospects page; a global
  quick-add can follow.
- [ ] **Mobile-optimized views** [solo] — prospects page ships mobile-first;
  client detail and lead entry get a pass next.

## Next — the follow-up engine

- [ ] **Follow-up reminders** [solo] — `leads.follow_up_date` already exists;
  surface a "Follow-ups due" list on Overview and add follow-up dates to
  Clients and Proposals. The research is blunt: written follow-up is the
  sales engine.
- [ ] **Email templates** [solo] — field-day thank-you, proposal follow-up,
  assessment confirmation, invoice reminder. Fill-in + copy to mail client.
- [ ] **Lead funnel finish** [solo] — stages and inbound wiring exist; add
  won→client conversion and lost-with-reason archiving.
- [ ] **Leads admin screen polish** [input] — owner idea 2026-07-04,
  specifics still TBD; inbound submissions land here so it earns a pass
  once he lists what bugs him.

## Soon — paper out the door

- [ ] **Markdown document PDF export** [solo] — the document viewer's
  "Download PDF" button is stubbed today: build it or hide it. Brand
  typography (Newsreader, IBM Plex Sans).
- [ ] **Invoice PDF export** [solo] — downloadable PDF from an invoice;
  portal download button.
- [ ] **Meeting notes** [solo] — timestamped running log on a client or
  project (distinct from evergreen relationship notes).
- [ ] **Referral tracking** [solo] — `leads.referred_by` exists; surface it
  (who sends work, who to thank) and add it to Clients.

## When there's data to show

- [ ] **Proposal win rate** [solo] — sent / accepted / rate on the Proposals
  overview.
- [ ] **Revenue by month chart** [solo] — invoiced vs paid by month
  (Recharts, already in stack).
- [ ] **Calendar view** [solo] — assessments, milestones, invoice due dates,
  follow-ups in one month view.
- [ ] **In-app Markdown viewer** [solo] — read project `.md` files in the UI.

## Big, and waiting on real clients

- [ ] **Milestone & deliverable billing / native accounting** [input] — the
  open questions are owner decisions: where `amount` lives (milestone vs
  deliverable vs both), what triggers an invoice draft, multi-milestone
  invoices, payment tracking downstream. No QuickBooks/FreshBooks — native.
- [ ] **Time tracking (future, reframed)** — owner, 2026-07-11: "eventually I
  will bring in time tracking just as a way to track profitability. No need
  now while I'm learning." Private job-costing against fixed prices — never
  an hourly-billing feed (D16).

## Owner steps (only Brian can do these)

- [ ] **Magic Link email template edit** [owner] — Supabase → Authentication
  → Email Templates → Magic Link: replace the ConfirmationURL anchor with
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
  Five minutes; it's the one thing between real clients and sign-in links
  that work from any browser. Then strike the register item in
  docs/decisions-log.md.
- [ ] **Google Workspace migration** [owner] — deferred until paying work
  lands (owner decision 2026-07-11; ~$8/mo). Checklist:
  1. Business Starter for ridgelineknows.com; users `brian@` + `hello@`
     (alias is $0).
  2. DNS (Squarespace, record-level): swap Zoho MX for Google's; KEEP every
     Resend record — Resend stays the app's sender; Workspace is human mail.
  3. Verify both addresses; retire Zoho after a safe overlap.
  4. App changes: none.
- [ ] **THE NAME section rewrite** [input] — Brian has source material (his
  song: permanence over riches, the morning ridgeline as the whole dream).
  Ask before drawing on it — the lyrics are Heart Echoes Music material and
  stay his. One grounded line beats a page of positioning copy.

## Content sweep (small)

- [ ] **Content-drafts location check** [solo] — the live site already says
  "the Lowcountry to Myrtle Beach and beyond" everywhere; sweep
  docs/extras/content/ drafts for stale Murrells Inlet phrasing.

---

## Notes

- Items are added here as they are spotted — not all will be built.
- When an item moves into active development, remove it from here and track
  it in the session task list.
- ✅ Built items removed this pass: extended contact details, cleanup tool,
  Resend setup, hello@ mailbox, Supabase auth SMTP (steps 1–2).
- Last updated: 2026-07-11
