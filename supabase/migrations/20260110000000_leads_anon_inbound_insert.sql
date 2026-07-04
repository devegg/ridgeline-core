-- ============================================================
-- Public contact form -> leads (inbound capture).
--
-- The website contact form runs as the anonymous role. Allow it to
-- INSERT a single, tightly-constrained inbound lead so submissions land
-- in /leads. The table otherwise stays locked to the authenticated owner
-- (see 20260106000000_add_leads_table: policy "owner_all").
--
-- Anon may INSERT only rows with source='inbound', stage='identified',
-- and no client link. Anon still cannot SELECT / UPDATE / DELETE, so it
-- can neither read the pipeline back nor modify anything.
-- ============================================================

CREATE POLICY "anon_inbound_insert" ON leads
  FOR INSERT TO anon
  WITH CHECK (
    source = 'inbound'
    AND stage = 'identified'
    AND converted_client_id IS NULL
  );
