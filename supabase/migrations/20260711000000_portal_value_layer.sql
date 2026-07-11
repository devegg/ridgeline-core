-- ============================================================
-- Portal value layer — the data behind the client dashboard.
--
-- Tables: automations, automation_activity, caught_issues,
-- roadmap_items, change_requests, portal_highlights.
-- Plus clients.blended_labor_rate and a fix to the documents
-- client policy (project/client entity types were invisible).
--
-- RLS follows 20260105: role/client_id from app_metadata only.
-- Explicit GRANTs follow the 20260108 lesson: missing grants
-- surface as silently empty lists, not errors.
-- ============================================================

-- ------------------------------------------------------------
-- clients: blended hourly labor cost used in the savings math.
-- Set per client from the audit baseline. Default keeps the
-- dashboard functional before a baseline is measured.
-- ------------------------------------------------------------
alter table clients
  add column if not exists blended_labor_rate numeric not null default 45;

-- ------------------------------------------------------------
-- automations — one row per live automation, plain language.
-- baseline_minutes_per_item: measured pre-build time per task,
-- counting only people who actually do the work.
-- ------------------------------------------------------------
create table automations (
  id                         uuid primary key default gen_random_uuid(),
  client_id                  uuid not null references clients(id) on delete cascade,
  project_id                 uuid references projects(id) on delete set null,
  name                       text not null,
  plain_summary              text,
  status                     text not null default 'running'
                             check (status in ('running', 'issue', 'paused')),
  baseline_minutes_per_item  numeric not null check (baseline_minutes_per_item > 0),
  started_on                 date not null default current_date,
  sort_order                 int not null default 0,
  created_at                 timestamptz default now() not null,
  updated_at                 timestamptz default now() not null
);

create index automations_client_idx on automations(client_id);
create trigger automations_updated_at
  before update on automations for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- automation_activity — daily rollups of items processed.
-- ------------------------------------------------------------
create table automation_activity (
  id               uuid primary key default gen_random_uuid(),
  automation_id    uuid not null references automations(id) on delete cascade,
  activity_on      date not null,
  items_processed  int not null default 0 check (items_processed >= 0),
  created_at       timestamptz default now() not null,
  unique (automation_id, activity_on)
);

create index automation_activity_automation_idx
  on automation_activity(automation_id, activity_on);

-- ------------------------------------------------------------
-- caught_issues — the "caught & fixed" log. Plain-language
-- summaries; active rows drive the amber health banner.
-- ------------------------------------------------------------
create table caught_issues (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients(id) on delete cascade,
  automation_id  uuid references automations(id) on delete set null,
  occurred_on    date not null default current_date,
  summary        text not null,
  detail         text,
  status         text not null default 'resolved'
                 check (status in ('resolved', 'active')),
  resolved_on    date,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

create index caught_issues_client_idx on caught_issues(client_id, occurred_on desc);
create trigger caught_issues_updated_at
  before update on caught_issues for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- roadmap_items — the "what's next" list.
-- ------------------------------------------------------------
create table roadmap_items (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  title       text not null,
  state       text not null default 'next'
              check (state in ('next', 'in_progress', 'shipped')),
  shipped_on  date,
  sort_order  int not null default 0,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index roadmap_items_client_idx on roadmap_items(client_id);
create trigger roadmap_items_updated_at
  before update on roadmap_items for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- change_requests — the written request log. First client
-- WRITE surface in the schema: the insert policy is strict.
-- response: Ridgeline's written reply (single reply for now).
-- ------------------------------------------------------------
create table change_requests (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  created_by    uuid not null,
  title         text not null,
  detail        text,
  urgency       text not null default 'normal'
                check (urgency in ('low', 'normal', 'high')),
  status        text not null default 'new'
                check (status in ('new', 'in_progress', 'done')),
  response      text,
  responded_on  date,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index change_requests_client_idx on change_requests(client_id, created_at desc);
create trigger change_requests_updated_at
  before update on change_requests for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- portal_highlights — owner-curated "peace of mind" lines.
-- No numeric claims; those live in the scoreboard math.
-- ------------------------------------------------------------
create table portal_highlights (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  line        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz default now() not null
);

create index portal_highlights_client_idx on portal_highlights(client_id);

-- ============================================================
-- RLS
-- ============================================================
alter table automations         enable row level security;
alter table automation_activity enable row level security;
alter table caught_issues       enable row level security;
alter table roadmap_items       enable row level security;
alter table change_requests     enable row level security;
alter table portal_highlights   enable row level security;

-- Owner/admin: full access (app_metadata.role != 'client')
create policy "owner_all" on automations for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

create policy "owner_all" on automation_activity for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

create policy "owner_all" on caught_issues for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

create policy "owner_all" on roadmap_items for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

create policy "owner_all" on change_requests for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

create policy "owner_all" on portal_highlights for all to authenticated
  using      (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

-- Clients: read their own rows
create policy "client_automations" on automations for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

create policy "client_automation_activity" on automation_activity for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and automation_id in (
      select id from automations
      where client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    )
  );

create policy "client_caught_issues" on caught_issues for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

create policy "client_roadmap_items" on roadmap_items for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

create policy "client_portal_highlights" on portal_highlights for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

-- Clients: read own requests, and create requests ONLY as
-- themselves for their own client record.
create policy "client_change_requests_read" on change_requests for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

create policy "client_change_requests_insert" on change_requests for insert to authenticated
  with check (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    and created_by = auth.uid()
  );

-- ============================================================
-- GRANTs (20260108 lesson — do not rely on default privileges)
-- ============================================================
grant all on automations, automation_activity, caught_issues,
             roadmap_items, change_requests, portal_highlights
  to authenticated, service_role;

-- ============================================================
-- Documents fix: shared docs attached to a PROJECT or to the
-- CLIENT record were is_shared=true yet invisible to clients
-- (the policy only covered assessment/proposal entities).
-- ============================================================
drop policy if exists "client_shared_documents" on documents;

create policy "client_shared_documents" on documents for select to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and is_shared = true
    and (
      (entity_type = 'client'
        and entity_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid)
      or
      (entity_type = 'project' and entity_id in (
        select id from projects
        where client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
      ))
      or
      (entity_type = 'assessment' and entity_id in (
        select id from assessments
        where client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
      ))
      or
      (entity_type = 'proposal' and entity_id in (
        select id from proposals
        where client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
      ))
    )
  );
