-- ============================================================
-- Portal demo seed — "Demo Client (Sample Data)".
--
-- Apply with the runner (never hand-paste SQL):
--   node scripts/run-migration.mjs scripts/seed-portal-demo.sql
-- AFTER the 20260711000000_portal_value_layer migration (npm run migrate).
--
-- Everything here is clearly-labeled sample data for demos and
-- QA. It is NOT a real client and must never be presented as
-- real results (workspace rule: never fabricate client results).
--
-- Idempotent: fixed UUIDs + upserts. Safe to re-run.
-- Remove entirely with the DELETE at the bottom (commented out).
-- ============================================================

-- The demo client
insert into clients (id, name, primary_contact, email, industry, location, status, blended_labor_rate, relationship_notes)
values (
  'de300000-0000-4000-8000-000000000001',
  'Demo Client (Sample Data)',
  'Dana Demo',
  'demo@example.com',
  'Vacation rental management',
  'Murrells Inlet, SC',
  'active',
  45,
  'Sample data for portal demos. Not a real client.'
)
on conflict (id) do update set
  name = excluded.name,
  blended_labor_rate = excluded.blended_labor_rate;

-- Three automations, plain-language names
insert into automations (id, client_id, name, plain_summary, status, baseline_minutes_per_item, started_on, sort_order)
values
  ('de300000-0000-4000-8000-00000000000a',
   'de300000-0000-4000-8000-000000000001',
   'Booking sync: reservations to the books',
   'New reservations copy themselves into the accounting system, so nobody re-types them.',
   'running', 3.5, '2026-02-02', 1),
  ('de300000-0000-4000-8000-00000000000b',
   'de300000-0000-4000-8000-000000000001',
   'Invoice intake: vendor bills read and filed',
   'Vendor bills arrive by email, get read automatically, and land in the books with the right codes.',
   'running', 8, '2026-03-10', 2),
  ('de300000-0000-4000-8000-00000000000c',
   'de300000-0000-4000-8000-000000000001',
   'Lead intake: inquiries answered fast',
   'New rental inquiries get an answer within a minute and a follow-up task, day or night.',
   'running', 6, '2026-04-21', 3)
on conflict (id) do update set
  name = excluded.name,
  plain_summary = excluded.plain_summary,
  status = excluded.status,
  baseline_minutes_per_item = excluded.baseline_minutes_per_item,
  started_on = excluded.started_on,
  sort_order = excluded.sort_order;

-- Daily activity from each automation's start date through today.
-- Deterministic volumes (weekday-shaped), so re-runs are stable.
insert into automation_activity (automation_id, activity_on, items_processed)
select a.id,
       d::date,
       case
         when a.id = 'de300000-0000-4000-8000-00000000000a' then
           case when extract(isodow from d) in (6, 7)
                then 18 + (extract(day from d)::int % 7)      -- weekends busier (turnovers)
                else 10 + (extract(day from d)::int % 5) end
         when a.id = 'de300000-0000-4000-8000-00000000000b' then
           case when extract(isodow from d) in (6, 7) then 0
                else 3 + (extract(day from d)::int % 3) end   -- weekday vendor bills
         else
           2 + (extract(day from d)::int % 4)                 -- inquiries every day
       end
from automations a
cross join lateral generate_series(a.started_on, current_date, interval '1 day') as d
where a.client_id = 'de300000-0000-4000-8000-000000000001'
on conflict (automation_id, activity_on) do update set
  items_processed = excluded.items_processed;

-- Caught & fixed log (all resolved — banner reads green)
insert into caught_issues (id, client_id, automation_id, occurred_on, summary, detail, status, resolved_on)
values
  ('de300000-0000-4000-8000-000000000021',
   'de300000-0000-4000-8000-000000000001',
   'de300000-0000-4000-8000-00000000000a',
   current_date - 3,
   'Caught 3 reservations that didn''t copy to the books and re-sent them.',
   'The connection between the booking system and the books timed out overnight. The system retried and all three went through. Nothing was lost.',
   'resolved', current_date - 3),
  ('de300000-0000-4000-8000-000000000022',
   'de300000-0000-4000-8000-000000000001',
   'de300000-0000-4000-8000-00000000000b',
   current_date - 9,
   'Flagged a vendor bill that looked like a duplicate before it was paid twice.',
   'Same vendor, same amount, four days apart. Held it for a human look; it was a duplicate.',
   'resolved', current_date - 9),
  ('de300000-0000-4000-8000-000000000023',
   'de300000-0000-4000-8000-000000000001',
   'de300000-0000-4000-8000-00000000000c',
   current_date - 16,
   'An inquiry arrived with a bad email address; saved it with the phone number instead.',
   null,
   'resolved', current_date - 16),
  ('de300000-0000-4000-8000-000000000024',
   'de300000-0000-4000-8000-000000000001',
   'de300000-0000-4000-8000-00000000000a',
   current_date - 27,
   'The hand-off between your apps was slow for 12 minutes overnight; everything caught up on its own.',
   null,
   'resolved', current_date - 27),
  ('de300000-0000-4000-8000-000000000025',
   'de300000-0000-4000-8000-000000000001',
   'de300000-0000-4000-8000-00000000000b',
   current_date - 41,
   'Caught a bill coded to the wrong property and corrected it.',
   null,
   'resolved', current_date - 41)
on conflict (id) do update set
  summary = excluded.summary,
  detail = excluded.detail,
  status = excluded.status,
  occurred_on = excluded.occurred_on,
  resolved_on = excluded.resolved_on;

-- What's next
insert into roadmap_items (id, client_id, title, state, shipped_on, sort_order)
values
  ('de300000-0000-4000-8000-000000000031',
   'de300000-0000-4000-8000-000000000001',
   'Auto-flag duplicate guest records', 'next', null, 1),
  ('de300000-0000-4000-8000-000000000032',
   'de300000-0000-4000-8000-000000000001',
   'Weekly owner-payout summary email', 'in_progress', null, 2),
  ('de300000-0000-4000-8000-000000000033',
   'de300000-0000-4000-8000-000000000001',
   'Refund requests now log themselves to your sheet', 'shipped', current_date - 6, 3)
on conflict (id) do update set
  title = excluded.title,
  state = excluded.state,
  shipped_on = excluded.shipped_on,
  sort_order = excluded.sort_order;

-- Peace-of-mind lines (no numeric claims)
insert into portal_highlights (id, client_id, line, sort_order)
values
  ('de300000-0000-4000-8000-000000000041',
   'de300000-0000-4000-8000-000000000001',
   'You haven''t had to re-type a reservation since February.', 1),
  ('de300000-0000-4000-8000-000000000042',
   'de300000-0000-4000-8000-000000000001',
   'No late-night "did it sync?" checks this quarter.', 2),
  ('de300000-0000-4000-8000-000000000043',
   'de300000-0000-4000-8000-000000000001',
   'Vendor bills stopped piling up on the desk.', 3)
on conflict (id) do update set
  line = excluded.line,
  sort_order = excluded.sort_order;

-- One answered change request, so the log shows a full round-trip
insert into change_requests (id, client_id, created_by, title, detail, urgency, status, response, responded_on)
values (
  'de300000-0000-4000-8000-000000000051',
  'de300000-0000-4000-8000-000000000001',
  'de300000-0000-4000-8000-0000000000ff',  -- placeholder uid; demo row is owner-visible either way
  'Can the booking sync include the cleaning fee line?',
  'Right now the cleaning fee shows up as part of the total. We''d like it broken out.',
  'normal',
  'done',
  'Done — cleaning fees now post as their own line item. You''ll see it on everything from March 18 forward.',
  '2026-03-18'
)
on conflict (id) do update set
  status = excluded.status,
  response = excluded.response,
  responded_on = excluded.responded_on;

-- ============================================================
-- To remove the demo entirely:
-- delete from clients where id = 'de300000-0000-4000-8000-000000000001';
-- (cascades to all portal tables; placeholder created_by is inert)
-- ============================================================
