-- ============================================================
-- Restore standard Supabase role grants.
--
-- Tables created via the management API (2026-07-03 cloud move)
-- missed the platform's default privileges: RLS policies existed
-- but anon/authenticated lacked table-level GRANTs, so every
-- PostgREST query failed with permission-denied (surfacing in the
-- app as silently empty lists).
--
-- Grants are deliberately broad (standard Supabase posture):
-- row access is controlled by RLS, which stays narrow.
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Future tables/sequences/functions created by this role inherit the grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
