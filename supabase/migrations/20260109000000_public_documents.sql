-- ============================================================
-- Public documents — powers the /papers white-paper surface.
-- is_public = true exposes a document to ANONYMOUS readers
-- (marketing site). Distinct from is_shared (client portal).
-- ============================================================

ALTER TABLE documents ADD COLUMN is_public boolean default false not null;

CREATE INDEX ON documents(is_public);

-- Anonymous visitors may read ONLY public documents
CREATE POLICY "anon_public_documents" ON documents FOR SELECT TO anon
  USING (is_public = true);

-- Authenticated non-client users already have owner_all; clients gain
-- nothing here (their policy is unchanged and public docs are marketing
-- content anyway).
