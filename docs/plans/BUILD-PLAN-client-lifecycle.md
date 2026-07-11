# Build plan — client-lifecycle wave (portfolio-complete portal)

Date: 2026-07-11. Branch: `feature/client-lifecycle`. PR to master.
Approved: owner ("Lets do it all"), with a fictitious client as the test bed
and job-interview demos as a stated use. Everything client-triggered ships
dark until its trigger fires; nothing fake is ever presented as real.

## The nine, lean v1s

1. **Audit intake, digitized** — owner generates a shareable link on an
   assessment; the prospect answers a fixed written question set (pains,
   volumes, tools, contacts) at a PUBLIC `/intake/[token]` page (no login).
   Write path is a bounded SECURITY DEFINER RPC (`submit_intake`) keyed by a
   single-use token — the ingest pattern reused. Answers land on the
   assessment (`intake_answers` jsonb) for the owner to read.
2. **Baseline capture** — the intake includes a "tasks that eat time"
   repeater (task, minutes each, times per week, who does it); shown on the
   assessment as the measured-baseline source for later automations.
3. **Care Plan on proposals** — `proposals.care_plan` jsonb: three tiers
   (name/price/summary) + an included-by-default flag, edited on the proposal
   form, rendered in the proposal view as the opt-out line item.
4. **Report send log + cron, dark** — `report_sends` rows on every send;
   `/api/cron/monthly-reports` (CRON_SECRET-gated) + a vercel.json cron on
   the 1st that sends only to clients with `report_auto_send = true`
   (default false for everyone → runs green, sends nothing, until a real
   care-plan client is flagged).
5. **Reply notifications** — owner replies to a change request → the client
   gets a Resend email deep-linking to `/portal/requests`; a client submits →
   hello@ gets notified. Soft-fail: email problems never block the save.
6. **Invoice pay links** — `invoices.pay_link`; owner pastes a Stripe payment
   link; the portal invoice shows a Pay button when sent/overdue.
7. **Machine-reported issues** — `POST /api/ingest/issue` with the same
   per-client bearer key (`ingest_issue` RPC): n8n error paths file
   caught-issues rows themselves; `status: active` ambers the client banner.
8. **Tier gating, lean** — `clients.plan_tier` (watch/improve/own, default
   improve): Watch sees the roadmap read-only with one calm locked-row nudge;
   the requests page states the tier's reply time. No separate dashboards.
9. **Case-study draft generator** — one button on the portal-data screen
   renders the client's real numbers into an anonymized draft (descriptor
   label, rounded figures, methodology note) saved as an UNSHARED `documents`
   row for owner editing. The one-data-model's third view.

Plus `docs/extras/demo-walkthrough.md` — the interview script: what to click,
in order, from intake to case study.

## Out of scope

Provisioning automation (registered, trigger unchanged); in-portal chat,
notification centers, SSO, native apps (permanent skip list).

## Verify

tsc; migration via the runner; curl the intake page + RPC paths (invalid
token 4xx); cron route 401 without secret; owner-screen smoke in the pane
where session allows; docs sync (D14+, register updates) rides the branch.
