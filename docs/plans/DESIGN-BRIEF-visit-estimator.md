# DESIGN BRIEF — on-site visit estimator

Owner request 2026-08-20. Design approved in session before any code.
Implementation plan follows as `BUILD-PLAN-visit-estimator.md`.

Source of the idea: `ridgeline/docs/business-dev/card-pitch-and-talking-points.md`
§ "Planned: on-site voice estimate tool".

## Why this exists

The card promises "No savings, no fee. If I save you $10,000, I keep $2,500."
Backing that up means finding a repetitive task and pricing it: minutes per
occurrence, occurrences per week, fully-loaded hourly rate, annualized.

Today that math happens silently, later, off-site. Doing it out loud on the
phone while the owner watches the number build turns a claim into a
demonstration. That is the entire point of this feature — the persuasion is in
watching the total grow, not in the arithmetic, which is trivial.

## What already exists (do not rebuild)

The field kit shipped 2026-07-12. Half of the original idea is already live:

| Capability | Where |
|---|---|
| Business-card photo → in-browser OCR → editable confirm | `components/dashboard/CardScan.tsx`, `lib/card-parse.ts` (D20) |
| Card photo stored private, owner-only | `cards` bucket, migration `20260712020000` |
| Company / contact / phone / email / address per business | `prospects` table (D19) |
| Visit log with date + card word | `prospect_visits` table |
| Promote-to-lead with a link back | `promoteToLeadAction` |
| Honest-math layer: 30% haircut, rounded output | `lib/portal/value.ts` |

What is missing is only the **task pricing** and the **screen to do it on**.

## Decisions locked in this design

| # | Decision | Rejected |
|---|---|---|
| 1 | Voice = the phone keyboard's own dictation (Gboard mic) on text fields. No in-app speech code. | Web Speech API per field (needs network, dies in a back office); whole-sentence auto-parse (misrecognition fails publicly) |
| 2 | Dictate the words, tap the numbers. Task label and who-does-it are text inputs; minutes / frequency / rate are numeric. | All-voice. Gboard's mic key does not appear on a numeric keypad, and saying "sixty" is slower and riskier than tapping `60`. |
| 3 | Show two numbers: raw annual cost, then the post-haircut recoverable figure. Both labeled. | Raw only (reads as a promise, portal undercuts it later); haircut only (loses the "this is bleeding you" moment) |
| 4 | Screen only, saved to the prospect. Nothing emailed, nothing handed over. | Emailed recap; auto-drafted proposal. Both commit to a number in writing on day one. The card's job is to book 15 minutes, not to close. |
| 5 | Dedicated route in a new `(field)` route group, outside `(dashboard)`. | Inline on the prospect card (crowds a 214-line component, poor on-site flow); standalone public calculator (new unauthenticated surface on a deny-by-default app) |

## The math

No new math. Import `HAIRCUT` and `formatDollars` from `lib/portal/value.ts`
so the field number and the portal number can never drift apart.

```
annualCost      = minutes_each × times_per_week × 52 × hourly_rate / 60
annualRecovered = annualCost × (1 - HAIRCUT)        // HAIRCUT = 0.3
```

Both render through `formatDollars` — rounded to the nearest $100, prefixed
`~`, no decimals. False precision reads as fake to a numerate buyer; that rule
is inherited, not reinvented.

Consequence worth stating plainly: with the haircut, clearing the card's
$10,000 promise takes roughly **$14,300 of raw annual task cost**. One
four-minute task done sixty times a week at $28/hr is ~$5,800. Most visits will
need two or three tasks to clear the bar. The running total is per visit, not
per task, for exactly this reason.

## Data model

Migration `20260820000000_visit_estimates.sql`.

```sql
create table visit_tasks (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  prospect_id    uuid not null references prospects(id) on delete cascade,
  visit_id       uuid references prospect_visits(id) on delete set null,
  label          text not null,
  who            text,
  minutes_each   numeric not null check (minutes_each   >= 0.5 and minutes_each   <= 480),
  times_per_week numeric not null check (times_per_week >= 0.1 and times_per_week <= 500),
  hourly_rate    numeric not null check (hourly_rate    >= 5   and hourly_rate    <= 500),
  sort_order     int not null default 0
);
```

- Bounds on `minutes_each` and `hourly_rate` mirror `set_value_inputs`
  (migration `20260712000000`) exactly, so a number captured in the field can
  never fall outside what the portal will later accept.
- **No stored dollar totals.** Money is derived on read. Editing a rate must
  never leave stale money in the database.
- `visit_id` is `on delete set null`, not cascade: deleting a mistaken visit
  log must not silently destroy the priced tasks.
- Owner-only RLS, no `role='client'` policies at all — the D8
  deny-by-default pattern, identical to `prospects` and `meeting_notes`.
- Index on `(prospect_id, created_at desc)`.

Applied with `npm run migrate`. Never hand-pasted into the Supabase editor.

## The screen

Route: `/prospects/[id]/visit`. One scrolling column, phone width first.

**Header** — business name, contact name, card word from the most recent
visit. Collapsed by default; expands to the card photo and a tap-to-call
phone link.

**Tasks** — the working area. Each task is a card:

- *What is it?* — text input. Gboard mic available. e.g. "Retyping vendor
  invoices from email"
- *Who does it?* — text input, optional. e.g. "Sherri, office admin"
- *Minutes each* / *Times per week* — numeric inputs, large tap targets
- *Rate* — inherited from the visit rate; a link reveals a per-task override
  for a different role

Once a card has all three numbers it shows its own two lines. "Add another
task" appends an empty card and scrolls to it.

**Running total** — `position: sticky; bottom: 0`. Always visible. Both
figures for the whole visit, plus the standing line: *"30% held back — I'd
rather beat the number than miss it."* This is what the owner watches. It
recalculates on every keystroke.

Below the fold: the visit rate, a notes field, and Save.

## Routing and layout

The route lives in a **new `(field)` route group**, not `(dashboard)`.

`app/(dashboard)/layout.tsx` renders a fixed 220px `.dash-sidebar` inside a
`height: 100vh; overflow: hidden` flex row, and **no media query in
`globals.css` collapses it** (13 media queries, none touch `.dash-sidebar`).
On a 390px phone that leaves ~170px of content. A screen meant to be read by
someone standing next to you cannot live inside it.

`app/(field)/layout.tsx` therefore duplicates the auth gate — `getUser`,
explicit `role !== 'owner'` redirect, same theme pre-paint script — and
renders full-bleed with no sidebar and no TopBar. Duplicating ~15 lines of
auth is the right trade against restyling 15 shipped pages mid-feature.

**Follow-up, not this build:** collapse `.dash-sidebar` under ~820px so the
rest of the field kit becomes usable on a phone. Log it in BACKLOG.md.

## Save path

One server action, `saveVisitEstimateAction`, added to the existing
`app/actions/prospects.ts` beside `logVisitAction`. Same `ownerClient()` gate,
same `ActionState` return shape, same `revalidatePath('/prospects')`.

In one call it:

1. Inserts a `prospect_visits` row (date, notes, card word if given).
2. Inserts the `visit_tasks` rows against that visit.
3. Bumps status `untouched` or `visited` → `interested`. Never walks a status
   backward, matching the existing guard in `logVisitAction`.

If step 2 fails, the visit row is deleted so a save is all-or-nothing — a
half-saved visit is worse than a failed one, because it looks complete.

**Offline behavior:** all arithmetic is client-side, so a dead spot mid-
conversation costs nothing. Save needs a connection. If it fails, the error
surfaces and the numbers stay on screen to retry — never a silent loss.

## Testing

No test framework exists in this repo; the house pattern is one bespoke node
script (`scripts/test-portal.mjs`). Follow it rather than introduce vitest.

`scripts/test-estimate.mjs`, run via `npm run test:estimate`:

1. Annualization is correct for a known case (60/wk × 4 min × $28/hr = $5,824 exact, ~$5,800 displayed).
2. The haircut figure agrees with `lib/portal/value.ts` — same input, same
   output, proving the two surfaces share one implementation.
3. Out-of-bounds values are rejected by the CHECK constraints (rate $4 and
   $501, minutes 0.25 and 481).
4. A client-role JWT cannot read or write `visit_tasks` (RLS).
5. Deleting a `prospect_visits` row leaves its tasks intact with a null
   `visit_id`; deleting the prospect removes them.

Creates throwaway rows and deletes everything it made, like `test-portal.mjs`.

Manual pass before merge: drive the screen at 390px width, confirm the sticky
total stays visible with the keyboard open, and confirm on Brian's actual
Android handset whether the Gboard mic key appears on the text fields and is
absent on the numeric ones. Decision 2 assumes that split; if the handset
behaves differently, the field types change, not the design.

## Out of scope

- Emailing or printing anything for the owner (decision 4)
- Generating a proposal from a visit (decision 4)
- Any in-app speech recognition code (decision 1)
- A public, unauthenticated calculator (decision 5)
- Collapsing the dashboard sidebar (logged as a follow-up)
- Editing tasks after save — v1 captures; corrections happen at the desk

## Risks

| Risk | Mitigation |
|---|---|
| Gboard mic absent on the text fields too, gutting the "voice" premise | Verified on the real handset before merge. The screen still works as a fast tap-form; the live total is the actual demo. |
| Owner hears the raw cost as a savings promise | Both numbers are labeled on screen and the haircut line is always visible. |
| A visit is priced against the wrong prospect | The route is prospect-scoped; the header shows the business name and card photo throughout. |
| Two or three tasks still fall short of $10k | Expected and fine. The number is what it is — never inflate inputs to clear the bar. |
