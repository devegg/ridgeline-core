# Build plan — the field-to-client chain

Window: **2026-08-22 → 2026-09-07**. Marketing cannot start until after Labor
Day weekend, so field days begin **2026-09-08**. That date is the deadline for
everything in Stage 1: on the morning of the 8th the field kit has to carry a
visit all the way through to a follow-up without anything being retyped.

Source: the 2026-08-21 review (`docs/__inbox/REVIEW-build-order-2026-08-21.md`).
Four breaks were found between the card scan and the portal. This plan closes
them in dependency order, then makes the app ready to receive a first yes.

## Why this order

The estimator shipped 2026-08-21 and works. What does not work is everything
downstream of it: the measured numbers stop at the table they were written to.
Fixing that is worth more than any new surface, because the numbers are already
being collected and are currently thrown away.

Portal work is deliberately **not** in Stage 1. Twelve portal pages exist and
one client-role account has ever signed in (2026-07-11, once). Nothing new goes
on that surface until a paying client is inside it.

---

## Stage 1 — close the chain (target: 2026-08-29)

Each item is its own branch and PR.

### 1.1 Card fields survive promotion — **done, this PR**
`promoteToLeadAction` dropped `contact_name`, `email` and `website`. Fixed, plus
`toHttpUrl` in `lib/safe-url.ts`: `prospects.website` accepts a bare domain but
`leads.website` has an http(s) CHECK, so an un-normalized copy would have failed
the whole promotion on a good website.

### 1.2 The saved estimate is readable
A visit's tasks and its total appear on the prospect and on the lead it becomes.
`visit_tasks` currently has one writer and no readers — the most valuable thirty
minutes of the sale is unrecoverable after you walk out.

- Read path in `lib/field/estimate.ts` terms; no new arithmetic.
- Money still derives on read (D21) — nothing stored.
- Shows on `/visit/[id]` (last visit), the prospect row, and the lead detail.

### 1.3 The recap email
One button after a saved visit: the recap — their tasks, their numbers, the
"rough estimate" caveat verbatim.

**Decided 2026-08-21: it goes to Brian, who forwards it.** Not to the prospect
directly. A human stays between an on-site conversation and a stranger's inbox,
and an OCR'd email address gets looked at before anything is sent to it.

- Resend, house sender convention. Recipient is the owner's own address.
- Same figures as the screen, from the same module. No new math, no new claims.
- Written so it can be forwarded as-is: no internal notes, no fee arithmetic
  the prospect has not already seen on the phone.
- This is the follow-up currently written from memory, and the reason the visit
  is worth saving at all.

### 1.4 Follow-up date on a prospect
`leads` has `follow_up_date` and the overview already surfaces "follow-ups due".
`prospects` has nothing, so a warm visit that is not promoted the same day has
nothing chasing it. One column, one input, one query change.

- Migration. Owner runs `npm run migrate`.

### 1.5 Visit tasks become draft automations at conversion
Lead → client currently creates the client at the default $45 blended rate with
no automations. Carry the measured rate onto the client and each timed task
through as a draft automation with a real `baseline_minutes_per_item`.

- Closes the open "no baseline, no claim" TBD in `docs/decisions-log.md`, using
  numbers that were already measured on site.
- The first portal login then opens on the client's own numbers, not an empty
  state — which is the adoption tactic the portal research calls "seed it before
  first login".

---

## Stage 2 — ready for a yes (target: 2026-09-05)

### 2.1 Route order for the field list
All 88 prospects have lat/lng from the KML import; `/visit` sorts them
alphabetically, which is no use for a driving day. Sort by distance from current
location (browser geolocation), with industry as a secondary filter.

Day one should open on a route, not a list.

### 2.2 Client-facing notifications with deep links
Five emails — proposal sent, deliverable released, document shared, invoice
issued, report ready — each landing on the item itself. Today the app sends a
client nothing except a change-request reply.

The portal research names this the third-biggest adoption lever. Blocked on 2.4.

### 2.3 The accounts screen
One page: every client, whether a login exists, its email, last sign-in, revoke.
Revoking access currently means opening the Supabase dashboard, and "has this
client ever logged in?" needs a SQL query to answer.

### 2.4 Owner steps (only Brian can do these)
- **Magic Link email template edit** — open in BACKLOG since 2026-07-11. Five
  minutes. Until it lands, sign-in links only work in the browser that asked.
  Every item in 2.2 depends on this.
- **Confirm `SUPABASE_SECRET_KEY` in Vercel production** — present in
  `.env.local`; unverified in prod. Without it, creating a client login from the
  live dashboard fails.
- **Client self-service password change** — `/settings` is owner-only, so a
  client's only recovery path is a magic link somebody has to tell them about.

---

## Needs a decision before it starts

**DECIDED 2026-08-21 — build it this window, with tesseract kept as the offline
fallback. Needs a new D# recording the change to D20 before the PR merges.**

**Vision-model card reading** re-opens **D20** (local tesseract OCR: $0, nothing
leaves the device before a human confirms). A vision call reads the cards that
currently fail and, more importantly, reads *handwritten* job sheets — which the
card pitch lists as a service Ridgeline sells and the present stack cannot demo
at all. The confirm screen stays either way; tesseract stays as the offline
fallback for a lobby with no signal.

Cost and privacy were the tradeoff; Brian called it on 2026-08-21. Scheduled
after Stage 1 — the chain comes first, because a better card reader feeding a
broken chain still loses the data at promotion.

---

## Out of scope for this window

- Any new portal surface (see "Why this order").
- Stripe recurring billing — real, and the care plan has no money mechanism
  today, but it waits for a signature rather than a guess.
- `.dash-sidebar` mobile collapse — 15 pages, and `/visit` already gives field
  work its own full-bleed path.
- Generated report narrative while no real numbers exist behind it.

## Standing gates

- `npx tsc --noEmit` before every PR.
- `npm run test:estimate` when field math is touched.
- `npm run test:portal` (36 checks, needs the dev server) before anything
  touching the portal or RLS.
- Merged is not shipped: confirm production reflects `master` HEAD after merge.
