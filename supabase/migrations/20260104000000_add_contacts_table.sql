-- ============================================================
-- Contacts table — individual people at a client company.
--
-- A client record holds company-level info (name, industry, etc.).
-- Contacts holds the actual humans: owner, project contact,
-- billing contact, etc.
--
-- is_portal_user flags contacts who have a Supabase Auth account
-- for the client portal. Their client_id in user_metadata should
-- match the parent client's id.
-- ============================================================

CREATE TABLE contacts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  client_id       uuid references clients(id) on delete cascade not null,
  name            text not null,
  title           text,
  role            text default 'contact' not null
                  CHECK (role IN ('owner', 'project_contact', 'billing', 'technical', 'other')),
  email           text,
  phone           text,
  is_portal_user  boolean default false not null,
  notes           text,
  -- Social / web presence (backlog item)
  linkedin_url    text,
  x_url           text,
  facebook_url    text,
  instagram_url   text,
  website         text
);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX ON contacts(client_id);
CREATE INDEX ON contacts(role);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "owner_all" ON contacts FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

-- Client portal: read contacts for their own client
CREATE POLICY "client_contacts" ON contacts FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
  );
