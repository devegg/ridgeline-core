# Build plan — activity ingest + owner portal-data screen

Date: 2026-07-11. Branch: `feature/activity-ingest`. PR to master.
Approved: owner ("Agree. Make it happen."), closing the register item
"activity ingest for real clients" (docs/decisions-log.md).

## What this ships

The portal dashboard becomes production-real: automation activity flows in
without hand-written SQL, and the owner manages every portal-facing record
from one screen.

1. **Machine ingest (n8n-shaped).** `POST /api/ingest/activity` with a
   per-client bearer key: `{ automation_id, activity_on, items_processed }`
   upserts a daily rollup row. No service-role key enters the app: the route
   calls a **bounded SECURITY DEFINER RPC** (`ingest_activity`) that verifies
   the key against a per-client hash stored in the DB, then upserts. (The
   RFQ Hunter precedent: first anon-callable function, bounded, D112-style.)
   Key lifecycle: owner generates/rotates per client; shown once; only the
   hash is stored.
2. **Owner portal-data screen.** `/clients/[id]/portal`: sections for
   automations (create/edit/status), manual activity quick-add, caught
   issues (add/resolve), roadmap (add/advance), peace-of-mind highlights
   (add/remove), and the ingest-key panel. Server actions; owner_all RLS
   already authorizes writes.
3. **Folded-in register items:** the portal nav overflow fix (wrap below
   ~900px so the theme toggle and sign-out stay reachable), and the
   magic-link end-to-end test (after the owner sets Supabase Auth URL
   config; his one dashboard step, requested when the branch is up).

## Migration (`20260711200000_activity_ingest.sql`)

- `clients.ingest_key_hash text` + `clients.ingest_key_created_at`.
- `ingest_activity(p_key text, p_automation uuid, p_on date, p_items int)`
  SECURITY DEFINER, `set search_path = public`: sha256(p_key) must match the
  automation's client's `ingest_key_hash`; upsert
  `automation_activity (automation_id, activity_on) items_processed`;
  bounded (no other table touched, items clamped >= 0); revoked from public,
  granted to anon + authenticated (the route uses the anon client).
- No new tables.

## Out of scope (stays on the register)

The monthly report email (the portal-adoption lever) — next after this, once
a real client exists to send it to.

## Verify before PR

tsc; ingest round trip against the demo client (key generate → POST → the
dashboard's numbers move); owner screen CRUD in the browser; nav at 800px
shows the toggle; magic-link send (pending the owner's URL-config step).
