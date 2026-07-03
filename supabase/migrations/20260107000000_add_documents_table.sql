-- ============================================================
-- Documents table — Markdown files attached to assessments,
-- proposals, projects, or clients.
--
-- Content is stored as text directly in the database.
-- is_shared = true makes the document visible in the client portal.
-- ============================================================

CREATE TABLE documents (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  entity_type  text not null
               CHECK (entity_type IN ('assessment', 'proposal', 'project', 'client')),
  entity_id    uuid not null,
  name         text not null,
  content      text not null,
  is_shared    boolean default false not null
);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX ON documents(entity_type, entity_id);
CREATE INDEX ON documents(is_shared);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "owner_all" ON documents FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

-- Client portal: read shared documents linked to their assessments or proposals
CREATE POLICY "client_shared_documents" ON documents FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND is_shared = true
    AND (
      (entity_type = 'assessment' AND entity_id IN (
        SELECT id FROM assessments
        WHERE client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
      ))
      OR
      (entity_type = 'proposal' AND entity_id IN (
        SELECT id FROM proposals
        WHERE client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
      ))
    )
  );
