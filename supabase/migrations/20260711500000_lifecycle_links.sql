-- ============================================================
-- Lifecycle connectors: the assessment→proposal→project thread
-- plus client proposal approval (the one-click sign-off).
-- ============================================================

-- Provenance: which assessment produced this proposal.
alter table proposals
  add column if not exists assessment_id uuid references assessments(id) on delete set null;

-- ------------------------------------------------------------
-- approve_proposal: the CLIENT's one-click yes. Bounded SECURITY
-- DEFINER (clients have no UPDATE policy on proposals): verifies
-- the caller's JWT is the proposal's client and the proposal is
-- pending, then approves + stamps accepted_at. Nothing else.
-- ------------------------------------------------------------
create or replace function approve_proposal(p_proposal uuid)
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

  update proposals
     set status = 'approved', accepted_at = now()
   where id = p_proposal
     and client_id = v_client
     and status = 'pending';

  if not found then
    raise exception 'not allowed';  -- wrong client, wrong status, or no such proposal
  end if;
end;
$$;

revoke all on function approve_proposal(uuid) from public;
grant execute on function approve_proposal(uuid) to authenticated;
