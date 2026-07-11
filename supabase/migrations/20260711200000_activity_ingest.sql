-- ============================================================
-- Activity ingest — machine-writable daily rollups, safely.
--
-- Design (BUILD-PLAN-activity-ingest.md): no service-role key
-- enters the app. A per-client ingest key (only its sha256 hash
-- stored) authorizes a single bounded SECURITY DEFINER function
-- that upserts one automation_activity row. Nothing else is
-- reachable with the key.
-- ============================================================

-- digest() needs pgcrypto (Supabase installs extensions in the
-- `extensions` schema; the function's search_path includes it below).
create extension if not exists pgcrypto with schema extensions;

alter table clients
  add column if not exists ingest_key_hash text,
  add column if not exists ingest_key_created_at timestamptz;

-- ------------------------------------------------------------
-- ingest_activity: verify key → upsert the daily rollup.
-- SECURITY DEFINER so the anon-role caller can write ONLY via
-- this bounded path; search_path pinned; volume clamped.
-- Returns the row's new items_processed on success.
-- Raises on a bad key / unknown automation (PostgREST → 400).
-- ------------------------------------------------------------
create or replace function ingest_activity(
  p_key        text,
  p_automation uuid,
  p_on         date,
  p_items      int
) returns int
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_client uuid;
  v_items  int;
begin
  if p_key is null or length(p_key) < 20 then
    raise exception 'invalid key';
  end if;
  if p_on is null or p_on > current_date or p_on < current_date - 366 then
    raise exception 'activity_on out of range';
  end if;

  select a.client_id into v_client
  from automations a
  join clients c on c.id = a.client_id
  where a.id = p_automation
    and c.ingest_key_hash is not null
    and c.ingest_key_hash = encode(digest(p_key, 'sha256'), 'hex');

  if v_client is null then
    raise exception 'invalid key';  -- same message as unknown automation: no oracle
  end if;

  v_items := greatest(0, least(coalesce(p_items, 0), 1000000));

  insert into automation_activity (automation_id, activity_on, items_processed)
  values (p_automation, p_on, v_items)
  on conflict (automation_id, activity_on)
    do update set items_processed = excluded.items_processed;

  return v_items;
end;
$$;

revoke all on function ingest_activity(text, uuid, date, int) from public;
grant execute on function ingest_activity(text, uuid, date, int) to anon, authenticated;
