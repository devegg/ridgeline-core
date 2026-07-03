-- ============================================================
-- Switch RLS policies from user_metadata to app_metadata.
--
-- user_metadata can be modified by users themselves via
-- supabase.auth.updateUser(). Supabase flags this as CRITICAL
-- because it allows privilege escalation.
--
-- app_metadata can only be set by the service role (admin),
-- making it safe for security decisions like role and client_id.
--
-- To set a user's role/client_id, use the SQL in the comments
-- at the bottom of this file, or the admin API.
-- ============================================================

-- ============================================================
-- Drop all existing role-based policies
-- ============================================================
DROP POLICY IF EXISTS "owner_all"          ON clients;
DROP POLICY IF EXISTS "owner_all"          ON projects;
DROP POLICY IF EXISTS "owner_all"          ON milestones;
DROP POLICY IF EXISTS "owner_all"          ON proposals;
DROP POLICY IF EXISTS "owner_all"          ON assessments;
DROP POLICY IF EXISTS "owner_all"          ON deliverables;
DROP POLICY IF EXISTS "owner_all"          ON invoices;
DROP POLICY IF EXISTS "owner_all"          ON billing_rates;
DROP POLICY IF EXISTS "owner_all"          ON contacts;
DROP POLICY IF EXISTS "client_own_record"  ON clients;
DROP POLICY IF EXISTS "client_projects"    ON projects;
DROP POLICY IF EXISTS "client_milestones"  ON milestones;
DROP POLICY IF EXISTS "client_assessments" ON assessments;
DROP POLICY IF EXISTS "client_deliverables" ON deliverables;
DROP POLICY IF EXISTS "client_invoices"    ON invoices;
DROP POLICY IF EXISTS "client_contacts"    ON contacts;

-- ============================================================
-- Owner / Admin — full access (app_metadata.role != 'client')
-- ============================================================
CREATE POLICY "owner_all" ON clients       FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON projects      FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON milestones    FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON proposals     FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON assessments   FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON deliverables  FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON invoices      FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON billing_rates FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON contacts      FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'owner') != 'client');

-- ============================================================
-- Client portal — scoped read-only access
-- ============================================================

CREATE POLICY "client_own_record" ON clients FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

CREATE POLICY "client_projects" ON projects FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    AND status != 'scheduled_delete'
  );

CREATE POLICY "client_milestones" ON milestones FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    )
  );

CREATE POLICY "client_assessments" ON assessments FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    AND status != 'scheduled_delete'
  );

CREATE POLICY "client_deliverables" ON deliverables FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND status = 'delivered'
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    )
  );

CREATE POLICY "client_invoices" ON invoices FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    AND status NOT IN ('draft', 'scheduled_delete')
  );

CREATE POLICY "client_contacts" ON contacts FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
  );

-- ============================================================
-- How to set a client user's role and client_id:
--
-- Run this in the SQL editor (replace both UUIDs):
--
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data ||
--     '{"role": "client", "client_id": "<client-uuid>"}'::jsonb
--   WHERE id = '<user-uuid>';
--
-- The user must log out and back in for the new JWT to take effect.
-- ============================================================

-- Clients can read their own proposals (non-draft).
-- Required so the documents RLS subquery can resolve proposal ownership
-- when checking whether a shared document belongs to them.
-- No proposals page exists in the portal UI.
CREATE POLICY "client_proposals" ON proposals FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'app_metadata' ->> 'client_id', ''))::uuid
    AND status NOT IN ('draft', 'scheduled_delete')
  );
