/**
 * Supabase API key resolution — new key system first, legacy fallback.
 *
 * The new keys (RFQ Hunter standard): publishable `sb_publishable_…` for the
 * browser, secret `sb_secret_…` server-only. The legacy anon/service_role JWT
 * keys are deprecated. The fallback keeps the app running until the new keys
 * land in .env.local and Vercel; remove the fallback once they're disabled in
 * the Supabase dashboard.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export const supabasePublishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
