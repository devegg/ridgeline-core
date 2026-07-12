-- Client-editable value inputs (owner request 2026-07-12):
-- "The savings math should run on the CLIENT's own numbers." The client can
-- set the blended hourly rate they assign their staff's time, and the
-- minutes-per-task baseline for each of their automations. Both already
-- exist as owner-set columns; this adds a bounded, deny-by-default write
-- path for the client role — no RLS loosening, one SECURITY DEFINER
-- function in the house pattern (approve_proposal et al.).
--
-- Bounds keep the honest math honest: rate $5–$500/hr, task time
-- 0.5–480 minutes. The 30% haircut in lib/portal/value.ts still applies
-- on top of whatever the client enters.

create or replace function set_value_inputs(
  p_rate numeric default null,
  p_automation uuid default null,
  p_minutes numeric default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
begin
  v_client := (nullif(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid;
  if auth.jwt() -> 'app_metadata' ->> 'role' is distinct from 'client' or v_client is null then
    raise exception 'not allowed';
  end if;

  if p_rate is null and (p_automation is null or p_minutes is null) then
    raise exception 'nothing to update';
  end if;

  if p_rate is not null then
    if p_rate < 5 or p_rate > 500 then
      raise exception 'rate out of bounds';
    end if;
    update clients
       set blended_labor_rate = p_rate
     where id = v_client;
    if not found then
      raise exception 'not allowed';
    end if;
  end if;

  if p_automation is not null and p_minutes is not null then
    if p_minutes < 0.5 or p_minutes > 480 then
      raise exception 'minutes out of bounds';
    end if;
    update automations
       set baseline_minutes_per_item = p_minutes
     where id = p_automation
       and client_id = v_client;
    if not found then
      raise exception 'not allowed';  -- wrong client or no such automation
    end if;
  end if;
end;
$$;

revoke all on function set_value_inputs(numeric, uuid, numeric) from public;
grant execute on function set_value_inputs(numeric, uuid, numeric) to authenticated;
