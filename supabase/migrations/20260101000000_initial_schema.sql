-- ============================================================
-- Ridgeline — Phase 1b Database Schema
-- Run this in your Supabase project's SQL editor.
-- ============================================================

-- ============================================================
-- Tables
-- ============================================================

create table clients (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  name          text not null,
  primary_contact text,
  email         text,
  phone         text,
  industry      text,
  location      text,
  relationship_notes text,
  status        text default 'active' not null
                check (status in ('active', 'prospective', 'past', 'archived'))
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  client_id   uuid references clients(id) on delete set null,
  name        text not null,
  description text,
  scope       text,
  status      text default 'active' not null
              check (status in ('active', 'on_hold', 'completed', 'archived')),
  start_date  date,
  end_date    date
);

create table milestones (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now() not null,
  project_id  uuid references projects(id) on delete cascade not null,
  title       text not null,
  due_date    date,
  completed_at timestamptz,
  sort_order  int default 0 not null
);

create table proposals (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  client_id     uuid references clients(id) on delete set null,
  project_id    uuid references projects(id) on delete set null,
  title         text not null,
  scope         text,
  pricing_notes text,
  total_amount  numeric(10,2),
  status        text default 'draft' not null
                check (status in ('draft', 'pending', 'approved', 'rejected', 'archived')),
  sent_at       timestamptz,
  accepted_at   timestamptz
);

create table assessments (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null,
  client_id            uuid references clients(id) on delete set null,
  project_id           uuid references projects(id) on delete set null,
  title                text not null,
  scheduled_date       date,
  findings             text,
  recommendations      text,
  status               text default 'scheduled' not null
                       check (status in ('scheduled', 'in_progress', 'completed')),
  completed_at         timestamptz,
  follow_up_project_id uuid references projects(id) on delete set null
);

create table deliverables (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  project_id   uuid references projects(id) on delete cascade,
  title        text not null,
  description  text,
  due_date     date,
  status       text default 'pending' not null
               check (status in ('pending', 'in_progress', 'completed', 'approved', 'delivered')),
  approved_at  timestamptz,
  delivered_at timestamptz
);

create table invoices (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null,
  client_id      uuid references clients(id) on delete set null,
  project_id     uuid references projects(id) on delete set null,
  invoice_number text,
  line_items     jsonb default '[]'::jsonb not null,
  subtotal       numeric(10,2) default 0 not null,
  total          numeric(10,2) default 0 not null,
  status         text default 'draft' not null
                 check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date       date,
  paid_at        timestamptz,
  notes          text
);

create table billing_rates (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now() not null,
  label       text not null,
  rate        numeric(10,2) not null,
  rate_type   text default 'hourly' not null
              check (rate_type in ('hourly', 'daily', 'fixed')),
  project_id  uuid references projects(id) on delete set null,
  is_default  boolean default false not null
);

-- ============================================================
-- updated_at auto-trigger
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at     before update on clients     for each row execute function update_updated_at();
create trigger projects_updated_at    before update on projects    for each row execute function update_updated_at();
create trigger proposals_updated_at   before update on proposals   for each row execute function update_updated_at();
create trigger assessments_updated_at before update on assessments for each row execute function update_updated_at();
create trigger deliverables_updated_at before update on deliverables for each row execute function update_updated_at();
create trigger invoices_updated_at    before update on invoices    for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table clients      enable row level security;
alter table projects     enable row level security;
alter table milestones   enable row level security;
alter table proposals    enable row level security;
alter table assessments  enable row level security;
alter table deliverables enable row level security;
alter table invoices     enable row level security;
alter table billing_rates enable row level security;

-- Phase 1b: authenticated users have full access.
-- Phase 2: tighten client portal to only show their own records.

create policy "auth_all" on clients       for all to authenticated using (true) with check (true);
create policy "auth_all" on projects      for all to authenticated using (true) with check (true);
create policy "auth_all" on milestones    for all to authenticated using (true) with check (true);
create policy "auth_all" on proposals     for all to authenticated using (true) with check (true);
create policy "auth_all" on assessments   for all to authenticated using (true) with check (true);
create policy "auth_all" on deliverables  for all to authenticated using (true) with check (true);
create policy "auth_all" on invoices      for all to authenticated using (true) with check (true);
create policy "auth_all" on billing_rates for all to authenticated using (true) with check (true);

-- ============================================================
-- Indexes
-- ============================================================

create index on clients(status);
create index on clients(name);
create index on projects(client_id);
create index on projects(status);
create index on proposals(client_id);
create index on proposals(status);
create index on assessments(client_id);
create index on assessments(status);
create index on deliverables(project_id);
create index on deliverables(status);
create index on invoices(client_id);
create index on invoices(status);
create index on milestones(project_id, sort_order);
