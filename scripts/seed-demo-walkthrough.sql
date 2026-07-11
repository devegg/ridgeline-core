-- ============================================================
-- Walkthrough demo client — "Coastal Cottage Rentals (Demo)".
--
-- Stages the FULL client lifecycle for docs/extras/demo-walkthrough.md:
-- client (Grand Strand vacation-rental PM — the research's #1 vertical),
-- automations + 120 days of activity, caught issues, roadmap, highlights,
-- change requests (one answered, one open), an assessment ready for the
-- live intake-link demo, a proposal carrying the Care Plan, and a sent
-- invoice (paste a Stripe payment link on it to demo the Pay button).
--
-- Clearly-labeled sample data; never presented as real results.
-- Idempotent (fixed UUIDs + upserts). Apply with the runner:
--   node scripts/run-migration.mjs scripts/seed-demo-walkthrough.sql
-- Remove entirely with the DELETE at the bottom (commented out).
-- ============================================================

insert into clients (id, name, primary_contact, email, industry, location, status,
                     blended_labor_rate, plan_tier, relationship_notes)
values (
  'dfde0000-0000-4000-8000-000000000001',
  'Coastal Cottage Rentals (Demo)',
  'Dana Shore',
  'brian@ridgelineknows.com',   -- an inbox you control: reports + notifications land here
  'Vacation rental management',
  'Garden City, SC',
  'active', 52, 'improve',
  'Walkthrough demo client. Sample data. Not a real business.'
)
on conflict (id) do update set
  name = excluded.name, email = excluded.email,
  blended_labor_rate = excluded.blended_labor_rate, plan_tier = excluded.plan_tier;

-- Three automations straight from the vertical's real pains
insert into automations (id, client_id, name, plain_summary, status, baseline_minutes_per_item, started_on, sort_order)
values
  ('dfde0000-0000-4000-8000-00000000000a',
   'dfde0000-0000-4000-8000-000000000001',
   'Owner payouts: reconciled and reported',
   'Every reservation''s fees, cleaning, and owner split reconcile themselves; owners get a clean monthly statement.',
   'running', 12, '2026-03-16', 1),
  ('dfde0000-0000-4000-8000-00000000000b',
   'dfde0000-0000-4000-8000-000000000001',
   'Turnovers: cleaning crew scheduling',
   'Checkouts create cleaning jobs automatically, matched to the right crew and window — no morning whiteboard scramble.',
   'running', 5, '2026-04-06', 2),
  ('dfde0000-0000-4000-8000-00000000000c',
   'dfde0000-0000-4000-8000-000000000001',
   'Guest inquiries: answered in a minute',
   'Every inquiry gets an instant answer and lands on the follow-up list, nights and weekends included.',
   'running', 4, '2026-05-04', 3)
on conflict (id) do update set
  name = excluded.name, plain_summary = excluded.plain_summary,
  status = excluded.status, baseline_minutes_per_item = excluded.baseline_minutes_per_item,
  started_on = excluded.started_on, sort_order = excluded.sort_order;

-- ~120 days of deterministic, weekday-shaped activity
insert into automation_activity (automation_id, activity_on, items_processed)
select a.id, d::date,
  case
    when a.id = 'dfde0000-0000-4000-8000-00000000000a' then
      case when extract(isodow from d) = 1 then 14 + (extract(day from d)::int % 6) else 2 + (extract(day from d)::int % 3) end
    when a.id = 'dfde0000-0000-4000-8000-00000000000b' then
      case when extract(isodow from d) in (5, 6, 7) then 9 + (extract(day from d)::int % 5) else 2 + (extract(day from d)::int % 2) end
    else 6 + (extract(day from d)::int % 7)
  end
from automations a
cross join lateral generate_series(a.started_on, current_date, interval '1 day') as d
where a.client_id = 'dfde0000-0000-4000-8000-000000000001'
on conflict (automation_id, activity_on) do update set items_processed = excluded.items_processed;

-- Caught & fixed (all resolved — green banner; file one live via the
-- ingest curl during the demo if you want to show amber)
insert into caught_issues (id, client_id, automation_id, occurred_on, summary, detail, status, resolved_on)
values
  ('dfde0000-0000-4000-8000-000000000021','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-00000000000a',
   current_date - 2,'Caught an owner statement with a duplicated cleaning fee before it went out.','Same fee posted twice by the booking channel. Corrected and re-checked the month.','resolved',current_date - 2),
  ('dfde0000-0000-4000-8000-000000000022','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-00000000000b',
   current_date - 6,'A same-day checkout/check-in got a rush cleaning slot automatically.',null,'resolved',current_date - 6),
  ('dfde0000-0000-4000-8000-000000000023','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-00000000000c',
   current_date - 11,'An inquiry from a blocked-calendar date got the right "not available, here''s an alternative" reply.',null,'resolved',current_date - 11),
  ('dfde0000-0000-4000-8000-000000000024','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-00000000000a',
   current_date - 19,'Channel fees changed mid-month; the reconciliation flagged 3 payouts for review before they posted.',null,'resolved',current_date - 19),
  ('dfde0000-0000-4000-8000-000000000025','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-00000000000b',
   current_date - 33,'A crew cancellation re-assigned four turnovers without a phone call.',null,'resolved',current_date - 33),
  ('dfde0000-0000-4000-8000-000000000026','dfde0000-0000-4000-8000-000000000001',null,
   current_date - 47,'Overnight sync between the booking channel and the books stalled for 20 minutes; caught up on its own.',null,'resolved',current_date - 47)
on conflict (id) do update set
  summary = excluded.summary, detail = excluded.detail,
  status = excluded.status, occurred_on = excluded.occurred_on, resolved_on = excluded.resolved_on;

-- Roadmap
insert into roadmap_items (id, client_id, title, state, shipped_on, sort_order)
values
  ('dfde0000-0000-4000-8000-000000000031','dfde0000-0000-4000-8000-000000000001','Monthly owner statements emailed automatically','in_progress',null,1),
  ('dfde0000-0000-4000-8000-000000000032','dfde0000-0000-4000-8000-000000000001','Flag bookings missing a signed rental agreement','next',null,2),
  ('dfde0000-0000-4000-8000-000000000033','dfde0000-0000-4000-8000-000000000001','Low-linen alert for the storage room','next',null,3),
  ('dfde0000-0000-4000-8000-000000000034','dfde0000-0000-4000-8000-000000000001','Review requests go out 2 days after checkout','shipped',current_date - 9,4)
on conflict (id) do update set
  title = excluded.title, state = excluded.state, shipped_on = excluded.shipped_on, sort_order = excluded.sort_order;

-- Peace of mind
insert into portal_highlights (id, client_id, line, sort_order)
values
  ('dfde0000-0000-4000-8000-000000000041','dfde0000-0000-4000-8000-000000000001','Saturday turnover mornings run without the whiteboard.',1),
  ('dfde0000-0000-4000-8000-000000000042','dfde0000-0000-4000-8000-000000000001','Owner statements go out without a late night first.',2),
  ('dfde0000-0000-4000-8000-000000000043','dfde0000-0000-4000-8000-000000000001','Inquiries get answered while you sleep.',3)
on conflict (id) do update set line = excluded.line, sort_order = excluded.sort_order;

-- Change requests: one answered, one open (respond to it live in the demo)
insert into change_requests (id, client_id, created_by, title, detail, urgency, status, response, responded_on)
values
  ('dfde0000-0000-4000-8000-000000000051','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-0000000000ff',
   'Can owner statements show the year-to-date column?','Owners keep asking for YTD when they call.','normal','done',
   'Done — statements now carry a YTD column next to the month. You''ll see it on the next run.', current_date - 15),
  ('dfde0000-0000-4000-8000-000000000052','dfde0000-0000-4000-8000-000000000001','dfde0000-0000-4000-8000-0000000000ff',
   'Add the new Surfside cottage to the turnover schedule','Closes on the 20th; first guests the following weekend.','high','new',null,null)
on conflict (id) do update set
  title = excluded.title, detail = excluded.detail, urgency = excluded.urgency,
  status = excluded.status, response = excluded.response, responded_on = excluded.responded_on;

-- Assessment, staged for the live intake-link demo (walkthrough step 1)
insert into assessments (id, client_id, title, scheduled_date, status)
values ('dfde0000-0000-4000-8000-000000000061','dfde0000-0000-4000-8000-000000000001',
        'Operations audit — Coastal Cottage Rentals', current_date + 7, 'scheduled')
on conflict (id) do update set title = excluded.title, scheduled_date = excluded.scheduled_date;

-- Proposal carrying the opt-out Care Plan (walkthrough step 2)
insert into proposals (id, client_id, title, scope, pricing_notes, total_amount, status, care_plan)
values (
  'dfde0000-0000-4000-8000-000000000071',
  'dfde0000-0000-4000-8000-000000000001',
  'Owner-payout reconciliation + turnover scheduling build',
  'Reconcile every reservation''s money automatically and schedule turnovers from checkouts — the two biggest time-eaters from the audit. Fixed scope, fixed price, live in 3 weeks.',
  'Fixed price. First 60 days of care included; the Care Plan below continues month to month after, cancel anytime.',
  6800, 'pending',
  '{"included": true,
    "note": "Every build includes its first 60 days of care at no charge; the plan below continues month to month after that, cancel anytime.",
    "tiers": [
      {"name": "Watch",   "price": "$350/mo",   "summary": "Monitoring, error alerts, fixes when something breaks, and the monthly report."},
      {"name": "Improve", "price": "$650/mo",   "summary": "Everything in Watch, plus one enhancement like the ones on your roadmap each month."},
      {"name": "Own",     "price": "$1,100/mo", "summary": "Everything in Improve, with continuous improvement work and first-priority response."}
    ]}'::jsonb
)
on conflict (id) do update set
  title = excluded.title, scope = excluded.scope, pricing_notes = excluded.pricing_notes,
  total_amount = excluded.total_amount, status = excluded.status, care_plan = excluded.care_plan;

-- Sent invoice (paste a Stripe payment link on it to light up the Pay button)
insert into invoices (id, client_id, invoice_number, line_items, subtotal, total, status, due_date, notes)
values (
  'dfde0000-0000-4000-8000-000000000081',
  'dfde0000-0000-4000-8000-000000000001',
  'DEMO-2026-001',
  '[{"description": "Build milestone 1 of 2 — payout reconciliation live", "quantity": 1, "rate": 3400, "amount": 3400}]'::jsonb,
  3400, 3400, 'sent', current_date + 14,
  'Sample invoice for the walkthrough demo.'
)
on conflict (id) do update set
  line_items = excluded.line_items, subtotal = excluded.subtotal, total = excluded.total,
  status = excluded.status, due_date = excluded.due_date, notes = excluded.notes;

-- ============================================================
-- To remove the walkthrough client entirely:
-- delete from clients where id = 'dfde0000-0000-4000-8000-000000000001';
-- (cascades to portal tables; proposals/invoices/assessments have
--  ON DELETE SET NULL — sweep those from the dashboard if you care)
-- ============================================================
