-- ============================================================
-- intake_context: given a VALID, UNUSED intake token, return the
-- prefill context (client + assessment title) so a known client
-- never types their own company name. Bounded SECURITY DEFINER,
-- same pattern as submit_intake; returns nothing for unknown or
-- already-submitted tokens (no oracle beyond validity itself).
-- ============================================================

create or replace function intake_context(p_token uuid)
returns table (
  assessment_title text,
  business_name    text,
  contact_name     text,
  contact_email    text,
  contact_phone    text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.title,
         c.name,
         c.primary_contact,
         c.email,
         c.phone
  from assessments a
  left join clients c on c.id = a.client_id
  where a.intake_token = p_token
    and a.intake_submitted_at is null
$$;

revoke all on function intake_context(uuid) from public;
grant execute on function intake_context(uuid) to anon, authenticated;
