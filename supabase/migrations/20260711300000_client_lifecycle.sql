-- ============================================================
-- Client-lifecycle wave (BUILD-PLAN-client-lifecycle.md):
-- digitized audit intake, care-plan proposals, report send log
-- + dark cron flag, invoice pay links, machine-reported issues,
-- lean plan tiers.
-- ============================================================

-- Intake: a single-use public token per assessment; answers land as jsonb.
alter table assessments
  add column if not exists intake_token uuid,
  add column if not exists intake_answers jsonb,
  add column if not exists intake_submitted_at timestamptz;
create unique index if not exists assessments_intake_token_idx
  on assessments(intake_token) where intake_token is not null;

-- Proposals: the care-plan (opt-out retainer) block.
alter table proposals
  add column if not exists care_plan jsonb;

-- Invoices: a pasted Stripe payment link makes portal billing payable.
alter table invoices
  add column if not exists pay_link text
  check (pay_link is null or pay_link ~* '^https://');

-- Clients: lean tier + the dark cron flag.
alter table clients
  add column if not exists plan_tier text not null default 'improve'
    check (plan_tier in ('watch', 'improve', 'own')),
  add column if not exists report_auto_send boolean not null default false;

-- Report send log.
create table report_sends (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  month      text not null,           -- YYYY-MM
  sent_to    text not null,
  sent_by    text not null default 'owner' check (sent_by in ('owner', 'cron')),
  sent_at    timestamptz default now() not null
);
create index report_sends_client_idx on report_sends(client_id, sent_at desc);
alter table report_sends enable row level security;
create policy "owner_all" on report_sends for all to authenticated
  using      (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');
grant all on report_sends to authenticated, service_role;

-- ------------------------------------------------------------
-- submit_intake: the public intake page's ONLY write path.
-- Token must match an assessment that has not been submitted.
-- Bounded: sets three columns on that one row, nothing else.
-- ------------------------------------------------------------
create or replace function submit_intake(p_token uuid, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_token is null or p_answers is null
     or pg_column_size(p_answers) > 100000 then
    raise exception 'invalid intake';
  end if;

  select id into v_id from assessments
    where intake_token = p_token and intake_submitted_at is null;
  if v_id is null then
    raise exception 'invalid intake';  -- unknown or already submitted
  end if;

  update assessments
    set intake_answers = p_answers,
        intake_submitted_at = now(),
        status = case when status = 'scheduled' then 'in_progress' else status end
    where id = v_id;
end;
$$;

revoke all on function submit_intake(uuid, jsonb) from public;
grant execute on function submit_intake(uuid, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- ingest_issue: machines file their own caught-issues rows with
-- the same per-client bearer key as activity ingest.
-- ------------------------------------------------------------
create or replace function ingest_issue(
  p_key        text,
  p_summary    text,
  p_detail     text default null,
  p_automation uuid default null,
  p_status     text default 'active'
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_client uuid;
  v_id uuid;
begin
  if p_key is null or length(p_key) < 20
     or p_summary is null or length(trim(p_summary)) = 0 or length(p_summary) > 500
     or p_status not in ('active', 'resolved') then
    raise exception 'invalid issue';
  end if;

  select id into v_client from clients
    where ingest_key_hash is not null
      and ingest_key_hash = encode(digest(p_key, 'sha256'), 'hex');
  if v_client is null then
    raise exception 'invalid key';
  end if;

  if p_automation is not null then
    perform 1 from automations where id = p_automation and client_id = v_client;
    if not found then
      raise exception 'invalid key';  -- same message: no oracle
    end if;
  end if;

  insert into caught_issues (client_id, automation_id, occurred_on, summary, detail, status, resolved_on)
  values (v_client, p_automation, current_date, trim(p_summary), nullif(trim(coalesce(p_detail, '')), ''),
          p_status, case when p_status = 'resolved' then current_date end)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function ingest_issue(text, text, text, uuid, text) from public;
grant execute on function ingest_issue(text, text, text, uuid, text) to anon, authenticated;
