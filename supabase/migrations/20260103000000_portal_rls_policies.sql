-- ============================================================
-- Portal RLS: replace broad auth_all with role-specific policies.
--
-- Owner/Admin (role != 'client' or unset): full access to everything.
-- Client (role = 'client'):               read-only, scoped to their
--                                         client_id stored in JWT metadata.
--
-- client_id is set on the Supabase Auth user record as:
--   user_metadata: { role: "client", client_id: "<uuid>" }
-- ============================================================

-- Helper: extract client_id safely from JWT user_metadata
-- Returns NULL if not set or not a valid UUID, preventing errors.
-- Used in all client portal policies below.

-- ============================================================
-- Drop existing permissive policies
-- ============================================================
DROP POLICY IF EXISTS "auth_all" ON clients;
DROP POLICY IF EXISTS "auth_all" ON projects;
DROP POLICY IF EXISTS "auth_all" ON milestones;
DROP POLICY IF EXISTS "auth_all" ON proposals;
DROP POLICY IF EXISTS "auth_all" ON assessments;
DROP POLICY IF EXISTS "auth_all" ON deliverables;
DROP POLICY IF EXISTS "auth_all" ON invoices;
DROP POLICY IF EXISTS "auth_all" ON billing_rates;

-- ============================================================
-- Owner / Admin policies — full access (role is not 'client')
-- ============================================================
CREATE POLICY "owner_all" ON clients      FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON projects     FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON milestones   FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON proposals    FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON assessments  FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON deliverables FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON invoices     FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

CREATE POLICY "owner_all" ON billing_rates FOR ALL TO authenticated
  USING      (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client')
  WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', 'owner') != 'client');

-- ============================================================
-- Client portal policies — scoped read-only access
-- ============================================================

-- Clients can view their own client record
CREATE POLICY "client_own_record" ON clients FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
  );

-- Clients can view their assigned projects (excluding flagged-for-delete)
CREATE POLICY "client_projects" ON projects FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
    AND status != 'scheduled_delete'
  );

-- Clients can view milestones on their projects
CREATE POLICY "client_milestones" ON milestones FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
    )
  );

-- Clients can view assessments linked to their account
CREATE POLICY "client_assessments" ON assessments FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
    AND status != 'scheduled_delete'
  );

-- Clients can only see deliverables that have been marked 'delivered'
CREATE POLICY "client_deliverables" ON deliverables FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND status = 'delivered'
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
    )
  );

-- Clients can view their invoices — not drafts or scheduled deletes
CREATE POLICY "client_invoices" ON invoices FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'client'
    AND client_id = (NULLIF(auth.jwt() -> 'user_metadata' ->> 'client_id', ''))::uuid
    AND status NOT IN ('draft', 'scheduled_delete')
  );

-- Clients have no access to proposals or billing rates
