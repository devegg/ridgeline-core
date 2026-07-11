-- ============================================================
-- Security hardening (2026-07-11 review findings).
--
-- C1  Authorization failed OPEN: an absent role was treated as
--     owner in every policy. Now owner access requires an
--     explicit app_metadata.role = 'owner'. Existing non-client
--     users are stamped 'owner' below so nobody locks out.
-- M3  change_requests insert could mass-assign status/response.
-- H2  leads.website / linkedin_url accepted any scheme
--     (javascript: links rendered in the owner dashboard).
-- M2  Portal value totals move to a SQL aggregate (RPC) so
--     they can't silently truncate at PostgREST's row cap.
-- M4  Future tables no longer default-grant to anon;
--     schema_migrations gets RLS.
-- ============================================================

-- ------------------------------------------------------------
-- C1a — stamp existing users: everyone who is not a client is
-- the owner (this is a one-owner shop). Future users get NO
-- role by default and therefore NO access. Deny by default.
-- ------------------------------------------------------------
update auth.users
set raw_app_meta_data =
  jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"owner"')
where coalesce(raw_app_meta_data ->> 'role', '') not in ('client', 'owner');

-- ------------------------------------------------------------
-- C1b — recreate every owner_all policy to require the role
-- explicitly. (Previously: COALESCE(role, 'owner') != 'client'.)
-- ------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'clients', 'projects', 'milestones', 'proposals', 'assessments',
    'deliverables', 'invoices', 'billing_rates', 'contacts', 'leads',
    'documents', 'automations', 'automation_activity', 'caught_issues',
    'roadmap_items', 'change_requests', 'portal_highlights'
  ]
  loop
    execute format('drop policy if exists "owner_all" on %I', t);
    execute format(
      'create policy "owner_all" on %I for all to authenticated
         using      (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''owner'')
         with check (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''owner'')',
      t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- M3 — clients may only create NEW requests, never pre-answered
-- ones (status/response/responded_on were assignable via the
-- raw API, allowing a forged "Ridgeline replied" entry).
-- ------------------------------------------------------------
drop policy if exists "client_change_requests_insert" on change_requests;

create policy "client_change_requests_insert" on change_requests for insert to authenticated
  with check (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    and client_id = (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    and created_by = auth.uid()
    and status = 'new'
    and response is null
    and responded_on is null
  );

-- ------------------------------------------------------------
-- H2 — URLs on leads must be http(s). NOT VALID skips existing
-- rows; every new/updated row is checked. (Render side is also
-- guarded in the app.)
-- ------------------------------------------------------------
alter table leads
  add constraint leads_website_http
  check (website is null or website ~* '^https?://') not valid;

alter table leads
  add constraint leads_linkedin_http
  check (linkedin_url is null or linkedin_url ~* '^https?://') not valid;

-- ------------------------------------------------------------
-- M2 — aggregate the value numbers in SQL. SECURITY INVOKER:
-- RLS on automations/automation_activity still applies, so a
-- client can only ever aggregate their own rows. The 30%
-- haircut stays in application code (ADR-100): this returns
-- RAW minutes; the app applies the haircut and rounding.
-- ------------------------------------------------------------
create or replace function portal_value_raw(p_client uuid, p_month_start date)
returns table (
  month_raw_minutes  numeric,
  month_items        bigint,
  launch_raw_minutes numeric,
  launch_items       bigint,
  last_activity_at   timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(aa.items_processed * a.baseline_minutes_per_item)
      filter (where aa.activity_on >= p_month_start), 0),
    coalesce(sum(aa.items_processed)
      filter (where aa.activity_on >= p_month_start), 0),
    coalesce(sum(aa.items_processed * a.baseline_minutes_per_item), 0),
    coalesce(sum(aa.items_processed), 0),
    max(aa.created_at)
  from automation_activity aa
  join automations a on a.id = aa.automation_id
  where a.client_id = p_client
$$;

grant execute on function portal_value_raw(uuid, date) to authenticated;

-- ------------------------------------------------------------
-- M4 — stop default-granting to anon on future tables (the
-- 20260108 defaults made every forgotten-RLS table anon-readable).
-- Existing anon needs (public documents read, inbound lead
-- insert) keep their explicit grants + scoped policies.
-- The new portal tables never needed anon at all.
-- ------------------------------------------------------------
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

revoke all on automations, automation_activity, caught_issues,
              roadmap_items, change_requests, portal_highlights
  from anon;

-- The runner's tracking table: owner-side tooling only. RLS on,
-- no policies: PostgREST roles get nothing; the runner connects
-- as the table owner and is unaffected.
do $$
begin
  if to_regclass('public.schema_migrations') is not null then
    execute 'alter table schema_migrations enable row level security';
    execute 'revoke all on schema_migrations from anon, authenticated';
  end if;
end $$;
