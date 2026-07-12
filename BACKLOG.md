# Ridgeline — Feature Backlog

Sorted 2026-07-11 (owner-reviewed sort): ordered by what makes sense next,
with field days as the lens. Autonomy tags: [solo] Claude builds without
input · [input] needs an owner decision first · [owner] owner-only step.

Deleted this pass (owner call, 2026-07-11): scaffold-to-project linking
(Scaffolder retired, D10), time tracking as billing feed (hourly is dead,
D16 — see future note below), location reframe (shipped with the landing
pages; only the content-drafts sweep remained and moved below).

---

## Shipped 2026-07-12 (overnight batch, PRs #34–#39)

- [x] Card drops + My Maps KML import + promote-to-lead ✅ (PR #31, D19)
- [x] Business-card scan: photo, in-browser OCR, confirm, save ✅ (PR #34, D20)
- [x] Follow-ups-due panel on Overview ✅ (PR #35)
- [x] Email templates (5 house emails, fill once, copy) ✅ (PR #36)
- [x] Document PDF: dead button → Print / PDF ✅ (PR #37)
- [x] Referral field on new-lead form + proposal win rate + content
      location sweep ✅ (PR #38)
- [x] Meeting notes on client detail ✅ (PR #39)
- [x] Lead funnel finish — discovered ALREADY BUILT (LeadDetail wires
      advance/convert/lost-with-reason); removed, nothing to do.

## Next

- [ ] **Mobile pass on client detail + lead entry** [solo] — prospects
  shipped phone-first; these two get the same treatment.
- [ ] **Global quick capture** [solo] — prospects quick-add exists on its
  page; a from-anywhere version can follow.
- [ ] **Leads admin screen polish** [input] — owner idea 2026-07-04,
  specifics still TBD; inbound submissions land here so it earns a pass
  once he lists what bugs him.
- [ ] **Invoice PDF export** [solo] — same Print/PDF treatment as documents,
  or a real renderer if pixel-perfect matters.
- [ ] **Map export back to My Maps** [solo] — generate a CSV/KML layer of
  visited/interested prospects to hand-import into the map (My Maps has no
  write API; owner asked 2026-07-12).

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
