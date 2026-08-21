-- On-site visit estimator (owner request 2026-08-20, DESIGN-BRIEF-visit-estimator).
-- A priced task observed during a drop-in visit: how long it takes, how often
-- it happens, what the person doing it costs. Money is NEVER stored — every
-- dollar figure is derived on read through lib/portal/value.ts, so changing a
-- rate can't leave stale money in the database.
--
-- Owner-only, like the rest of the field kit (D19/D20): no policies for
-- role=client at all.

create table visit_tasks (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  prospect_id    uuid not null references prospects(id) on delete cascade,
  -- set null, not cascade: deleting a mistaken visit log must not silently
  -- destroy the priced tasks gathered during it.
  visit_id       uuid references prospect_visits(id) on delete set null,
  label          text not null,
  who            text,
  -- Bounds mirror set_value_inputs (20260712000000) exactly, so a number
  -- captured in the field can never fall outside what the portal accepts.
  minutes_each   numeric not null check (minutes_each   >= 0.5 and minutes_each   <= 480),
  times_per_week numeric not null check (times_per_week >= 0.1 and times_per_week <= 500),
  hourly_rate    numeric not null check (hourly_rate    >= 5   and hourly_rate    <= 500),
  sort_order     int not null default 0
);

create index visit_tasks_prospect_idx on visit_tasks (prospect_id, created_at desc);

alter table visit_tasks enable row level security;

create policy visit_tasks_owner_all on visit_tasks for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

grant all on visit_tasks to authenticated, service_role;
