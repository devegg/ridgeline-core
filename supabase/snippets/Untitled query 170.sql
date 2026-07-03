-- Salem Smart Log — Milestone Insert
-- Run in Ridgeline's Supabase SQL editor.
-- Adjust the project name below if it differs from what's in your projects table.

WITH p AS (
  SELECT id FROM projects WHERE name = 'Salem Platform' LIMIT 1
)
INSERT INTO milestones (project_id, title, due_date, completed_at, sort_order)
SELECT
  p.id,
  v.title,
  v.due_date,
  v.completed_at,
  v.sort_order
FROM p,
(VALUES
  ('Assessment & Scoping',                  DATE '2026-02-10', TIMESTAMPTZ '2026-02-10 00:00:00+00',  1),
  ('Proposal Sent',                         DATE '2026-02-18', TIMESTAMPTZ '2026-02-17 00:00:00+00',  2),
  ('Proposal Accepted — Kick-off',          DATE '2026-03-02', TIMESTAMPTZ '2026-02-28 00:00:00+00',  3),
  ('Database Schema & Authentication',      DATE '2026-03-16', TIMESTAMPTZ '2026-03-13 00:00:00+00',  4),
  ('Core Dashboard & Job Management',       DATE '2026-03-30', TIMESTAMPTZ '2026-03-27 00:00:00+00',  5),
  ('Document OCR Pipeline',                 DATE '2026-04-13', TIMESTAMPTZ '2026-04-10 00:00:00+00',  6),
  ('File Import System (CSV / PDF / XLSX)', DATE '2026-04-24', TIMESTAMPTZ '2026-04-22 00:00:00+00',  7),
  ('Reconciliation Engine',                 DATE '2026-05-04', TIMESTAMPTZ '2026-05-01 00:00:00+00',  8),
  ('Government Inquiry Management',         DATE '2026-05-11', TIMESTAMPTZ '2026-05-08 00:00:00+00',  9),
  ('Contact Directory & Vendor Management', DATE '2026-07-10', TIMESTAMPTZ '2026-05-18 00:00:00+00', 10),
  ('Reporting & Analytics',                 DATE '2026-08-02', NULL::timestamptz,                     11),
  ('Punchlist Tasks',                       DATE '2026-08-12', NULL::timestamptz,                     12),
  ('User Training & Acceptance Testing',    DATE '2026-08-22', NULL::timestamptz,                     13),
  ('Final Punchlist Tasks',                 DATE '2026-09-05', NULL::timestamptz,                     14),
  ('Production Deployment',                 DATE '2026-09-15', NULL::timestamptz,                     15),
  ('Post-Launch Optimization & Handoff',    DATE '2026-10-07', NULL::timestamptz,                     16)
) AS v(title, due_date, completed_at, sort_order);
SELECT id, name FROM projects;