-- ============================================================
-- Leads / CRM table.
--
-- Tracks prospects through a pre-client pipeline.
-- Card drops are leads at stage = 'identified' with minimal info.
-- When a lead is won, convert_to_client() creates a Client record
-- and sets converted_client_id.
-- ============================================================

CREATE TABLE leads (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null,

  -- Who they are
  business_name        text not null,
  contact_name         text,
  contact_title        text,
  email                text,
  phone                text,
  industry             text,
  location             text,

  -- Pipeline
  stage                text default 'identified' not null
                       CHECK (stage IN ('identified','contacted','meeting_scheduled','proposal_sent','won','lost')),
  lost_reason          text,
  follow_up_date       date,

  -- How they came to you
  source               text default 'card_drop' not null
                       CHECK (source IN ('card_drop','referral','networking_event','cold_outreach','inbound','other')),
  referred_by          text,

  -- Notes and web presence
  notes                text,
  linkedin_url         text,
  x_url                text,
  facebook_url         text,
  instagram_url        text,
  website              text,

  -- Set when stage = 'won'
  converted_client_id  uuid references clients(id) on delete set null
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX ON leads(stage);
CREATE INDEX ON leads(follow_up_date);
CREATE INDEX ON leads(source);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON leads FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');
