import { createClient } from '@supabase/supabase-js'
import { supabaseUrl } from '@/lib/supabase/keys'

/**
 * Server-only Supabase client on the SECRET key (`sb_secret_…`). Allowed in
 * exactly two kinds of surface, both owner-controlled:
 *   1. the CRON_SECRET-gated monthly-report route (no user session to ride)
 *   2. owner-gated server actions that administer Supabase AUTH itself
 *      (e.g. changing a client's login email) — RLS cannot reach auth.users.
 * Everything user-facing stays on the publishable key + RLS; never import
 * this into a page component, public route, or client-reachable action.
 *
 * Dark until SUPABASE_SECRET_KEY is set (BACKLOG owner step).
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret) throw new Error('SUPABASE_SECRET_KEY not configured')
  return createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
