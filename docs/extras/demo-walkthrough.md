# Demo walkthrough — the full client lifecycle in ~10 minutes

One-line purpose: the click-path for showing Ridgeline end to end (interview,
prospect, or partner), using a clearly-labeled fictitious client.
Last Updated: 2026-07-11

Ground rule: the demo client is named as sample data and stays that way —
nothing fictitious is ever presented as a real result (workspace rule).

## Setup once (5 minutes)

1. Dashboard → Clients → New: create the fictitious client (industry +
   location make the case-study draft read better). Add an email you control.
2. Client page → **Portal data**: set the care-plan tier, add 2–3 automations
   with plain names and baselines, a few caught issues, roadmap items, and
   peace-of-mind lines. Record a couple of manual activity days (or seed via
   the ingest curl below).

## The demo, in order

1. **The written intake.** Assessments → New (pick the client) → the Written
   intake panel → Generate intake link → open it in a private window. Fill it
   as the client would: pains, the worst time-eater in their words, the
   baselines table. Submit → back on the assessment, the answers are there,
   with weekly-hours math on the baselines. *Point made: the sales motion is
   written, structured, and lands in the system of record.*
2. **The proposal with the opt-out Care Plan.** Proposals → New: title,
   scope, total, and the Care Plan block (three tiers, included by default).
   Open the proposal: the retainer is a line item, not an upsell. *Point:
   recurring revenue is installed at proposal time.*
3. **Machine ingest.** Portal data → Machine ingest → Generate key, then:

   ```
   curl -X POST https://www.ridgelineknows.com/api/ingest/activity \
     -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
     -d '{"automation_id":"<id from the panel>","items_processed":42}'

   curl -X POST https://www.ridgelineknows.com/api/ingest/issue \
     -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
     -d '{"summary":"Caught 2 orders that did not sync and re-sent them.","status":"resolved"}'
   ```

   *Point: authorization lives inside the database; the app holds no master
   key; n8n error paths file their own caught-issues rows.*
4. **The client dashboard.** Portal preview → pick the client. The ten-second
   read: health banner, hours/dollars/issues with "How I count this" open
   (the 30% haircut stated in plain language), caught & fixed, what's next.
   Toggle dark mode. *Point: honest math is the retention product.*
5. **The request round trip.** As the client (or via owner preview note):
   file a request → hello@ gets notified → reply from Dashboard → Requests →
   the client gets an email deep-linking back to their portal thread.
6. **Billing.** Invoice with a Stripe payment link pasted in → the portal
   shows a Pay button. *Point: payable billing with zero billing code.*
7. **The monthly report.** Portal data → Monthly report → send to yourself.
   The email is the dashboard's numbers as a narrative, with the methodology
   footer. Mention the cron: it exists, gated, dark until a real client is
   flagged. *Point: the monthly touch that makes a retainer feel obviously
   worth paying.*
8. **The case study.** Portal data → Draft case study → open Documents: the
   same numbers, anonymized to a descriptor label, rounded, with a
   methodology section and [TBD] markers where human judgment belongs.
   *Point: delivery data becomes marketing without fabricating anything.*

## The one-liner that frames it

Every number on every surface traces to one module and real rows — the
dashboard, the report, and the case study can't disagree with each other.
