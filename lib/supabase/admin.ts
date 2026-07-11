import { createClient } from '@supabase/supabase-js'
import { supabaseUrl } from '@/lib/supabase/keys'

/**
 * Server-only Supabase client on the SECRET key (`sb_secret_…`) — used by
 * exactly one surface: the CRON_SECRET-gated monthly-report route, which has
 * no user session to ride. Everything user-facing stays on the publishable
 * key + RLS; never import this into a page, action, or public route.
 *
 * Deliberately dark: throws until SUPABASE_SECRET_KEY is set (the register
 * step when the first care-plan client gets flagged for auto-send).
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret) throw new Error('SUPABASE_SECRET_KEY not configured')
  return createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
