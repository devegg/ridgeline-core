# Test plan — portal + client lifecycle

One-line purpose: what gets verified, how, and the pass bar, before any
client-facing walkthrough. Last Updated: 2026-07-11.

## Two layers

1. **The automated suite** — from `core/`: `npm run test:portal` (or from the
   workspace root: `node core/scripts/test-portal.mjs`; against production:
   `BASE_URL=https://www.ridgelineknows.com npm run test:portal`). The local
   target needs the dev server up; keys come from `core/.env.local`. Zero test data survives a
   run: it creates an ephemeral client login, exercises everything, and
   deletes what it made. Run it before every walkthrough and after any
   portal-touching change. **Pass bar: 0 failures.**
2. **The human walkthrough** — `docs/extras/demo-walkthrough.md`, which is
   both the demo script and the acceptance test for everything a script
   can't judge (copy, layout, feel).

## What the suite covers

**A. Public surface** — every public route answers correctly: home, login,
papers (a real DB read), the intake page, and the auth gates (portal and
dashboard redirect to login; cron and both ingest routes refuse without
credentials).

**B. RPC hardening (anonymous)** — the SECURITY DEFINER surface refuses bad
input: `submit_intake` with an unknown token, `intake_context` returns
nothing for garbage, `approve_proposal` without a session, `ingest_activity`
and `ingest_issue` with wrong keys.

**C. Tenant isolation (the big one)** — an ephemeral CLIENT login is created
against the sample client, signs in for real, and proves it can only see its
own world: its one client row, its own automations/issues/roadmap/highlights/
requests/proposals/invoices, zero rows from the other client, zeroed value
aggregates for a foreign client id, refused cross-client proposal approval,
refused writes to read-only tables, refused forged change-requests
(pre-answered status/response, spoofed created_by), and one clean
change-request insert that succeeds exactly as designed.

**D. Ingest round trip** — arms a throwaway ingest key, posts one activity
row and one issue through the real HTTP routes, verifies both landed, and
removes them.

**E. Light stress** — parallel bursts against the public pages and the
ingest gates; the bar is correct statuses and zero 5xx, not throughput.

## Manual checklist (after the suite is green)

The demo walkthrough end to end, plus the connectors added today:
- Assessment → "Draft proposal from this" lands in a pre-filled editor.
- Proposal (pending) shows in the client portal with the Care Plan; Approve
  as the client → timestamped, owner notified, "Create project" appears on
  the owner side.
- Requests: reply with "add to roadmap" checked on Done → the item appears
  on the client's What's Next as just shipped.
- Portal nav reads in lifecycle order.

## Known limits

The suite runs against the shared database (this project's single-DB
setup): it cleans up after itself, but don't run it mid-demo. Browser-only
concerns (theme flash, scroll behavior, email rendering) stay manual.
