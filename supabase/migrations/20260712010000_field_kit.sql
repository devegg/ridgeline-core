-- Field kit v1 (owner request 2026-07-11): a touchpoint log for card drops.
-- `prospects` are businesses visited or targeted on field days — NOT clients,
-- NOT leads. Each visit records the date and which card word was handwritten
-- (the /vrm, /plumbing system). A warm prospect promotes to a Lead
-- (source: card_drop) and keeps a link back.
--
-- Owner-only tables: the client role has no path to these (deny-by-default,
-- D8 — no policies for role=client at all).

create table prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null,
  industry text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  website text,
  source text not null default 'manual' check (source in ('manual', 'map_import')),
  status text not null default 'untouched' check (status in ('untouched', 'visited', 'interested', 'lead', 'archived')),
  notes text,
  lead_id uuid references leads(id) on delete set null
);

-- Re-running a map import must not duplicate pins.
create unique index prospects_dedupe_idx on prospects (business_name, coalesce(address, ''));

create table prospect_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  visited_on date not null default current_date,
  card_word text,
  note text
);

create index prospect_visits_prospect_idx on prospect_visits (prospect_id, visited_on desc);

alter table prospects enable row level security;
alter table prospect_visits enable row level security;

create policy prospects_owner_all on prospects for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

create policy prospect_visits_owner_all on prospect_visits for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

grant all on prospects to authenticated, service_role;
grant all on prospect_visits to authenticated, service_role;
