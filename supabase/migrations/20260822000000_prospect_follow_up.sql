-- Follow-up dates on prospects (build plan 1.4).
--
-- `leads` has had follow_up_date since 20260106 and the Overview surfaces
-- "Follow-ups due" from it. `prospects` had nothing, so a drop-in that went
-- well but was not promoted to a Lead the same day had nothing chasing it —
-- the warmest moment in the pipeline was also the one with no reminder.
--
-- ADDITIVE ONLY (D24): one nullable column and one partial index. Nothing is
-- dropped, retyped or backfilled; every existing row keeps NULL and behaves
-- exactly as before.

alter table prospects
  add column if not exists follow_up_date date;

-- The Overview query is "due within a week, still in play", so index the
-- rows that can actually match. Prospects already promoted or archived are
-- out of the funnel and never appear in it.
create index if not exists prospects_follow_up_idx
  on prospects (follow_up_date)
  where follow_up_date is not null
    and status in ('untouched', 'visited', 'interested');
