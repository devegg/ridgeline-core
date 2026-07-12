-- Meeting notes (backlog, 2026-07-12): a timestamped running log on a client,
-- distinct from evergreen relationship notes. Owner-only, D8 pattern.

create table meeting_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  noted_on date not null default current_date,
  note text not null
);

create index meeting_notes_client_idx on meeting_notes (client_id, noted_on desc);

alter table meeting_notes enable row level security;

create policy meeting_notes_owner_all on meeting_notes for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

grant all on meeting_notes to authenticated, service_role;
