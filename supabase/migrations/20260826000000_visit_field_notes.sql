-- Structured field notes (owner request 2026-08-26).
--
-- WHY THIS EXISTS: `prospect_visits.note` is a single free-text column. The
-- shape actually wanted was already written down — docs/business-dev/
-- field-notes/TEMPLATE.md in the ridgeline workspace — but it lived only as a
-- markdown template, which is not a thing anyone fills in standing in someone
-- else's shop. So the good structure was unreachable and the phone captured a
-- blob. This promotes the template's sections to columns.
--
-- A blob is worth nothing later. Structured from visit #1 means the databank
-- gets a non-desk source it can actually query, which is the whole point.
--
-- Separate table, not columns on prospect_visits, and for the same reason
-- visit_tasks is separate: a plain door-knock logs a visit with no
-- conversation, and those rows must stay cheap. One note per visit at most.
--
-- Owner-only, like the rest of the field kit (D19/D20): no policies for
-- role=client at all.

create table visit_notes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  prospect_id  uuid not null references prospects(id) on delete cascade,
  -- cascade, unlike visit_tasks: a note is ABOUT one conversation and means
  -- nothing detached from it, whereas a priced task keeps its value.
  visit_id     uuid not null unique references prospect_visits(id) on delete cascade,

  -- Which field card was read before walking in. Traces `card_got_wrong`
  -- back to a file in docs/business-dev/scenarios/, e.g. 'hvac-plumbing-electrical'.
  card_slug        text,
  spoke_with_role  text,
  duration_minutes int check (duration_minutes >= 0 and duration_minutes <= 480),

  -- What they actually run: software, and also the whiteboard, the wall
  -- calendar, the notebook. The non-software half is usually the opening.
  stack_observed     text,
  how_things_arrive  text,
  who_moves_it       text,

  -- The spreadsheet block. The research's finding #2: almost every business
  -- has one the software doesn't cover, it is owned by one person, and nobody
  -- publishes this — it can only be found by asking.
  sheet_what          text,
  sheet_columns       text,
  sheet_owner_role    text,
  -- ⭐ Desk-unanswerable question #1. START-HERE.md: "What breaks when the
  -- person who owns the spreadsheet is out." Looked for and not published
  -- anywhere, because nobody has a reason to write it down.
  sheet_owner_out     text,
  sheet_document_home text,

  -- ⭐ Desk-unanswerable question #2. START-HERE.md: "What happens to the
  -- books when something goes wrong" — refund, void, chargeback, card fee.
  -- No vendor documents it, so a person somewhere handles it by hand with no
  -- instructions. That person is the prospect.
  exception_handling text,

  -- "Show me the transaction", never "does it integrate" — everyone says yes
  -- to the second. Both halves stored: what was asked for, and what was
  -- actually on screen.
  transaction_asked    text,
  transaction_observed text,

  -- Verbatim, not tidied up. Five research batches produced zero first-person
  -- owner quotes; the first row written here ends that.
  owner_words text,

  -- The most important line on the page: the loop back into the databank.
  card_got_wrong text,

  -- Which of the five service lines this maps to (fable-service-catalogue.md).
  service_line        text check (service_line in ('L1', 'L2', 'L3', 'L4', 'L5')),
  -- Did the doorway test say walk away, and which map entry was tested.
  disqualified        boolean,
  disqualify_map_entry text,

  follow_up_owed text
);

create index visit_notes_prospect_idx on visit_notes (prospect_id, created_at desc);
-- Partial indexes: the two questions the research could not answer from a
-- desk are the ones worth sweeping across every visit later.
create index visit_notes_owner_out_idx  on visit_notes (created_at desc) where sheet_owner_out    is not null;
create index visit_notes_exceptions_idx on visit_notes (created_at desc) where exception_handling is not null;
create index visit_notes_card_wrong_idx on visit_notes (card_slug)       where card_got_wrong    is not null;

create trigger visit_notes_updated_at
  before update on visit_notes
  for each row execute function update_updated_at();

alter table visit_notes enable row level security;

create policy visit_notes_owner_all on visit_notes for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

grant all on visit_notes to authenticated, service_role;
