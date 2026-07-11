/**
 * Supabase API key resolution — one point for browser/server/middleware.
 *
 * New key system only (RFQ Hunter standard): publishable `sb_publishable_…`
 * for the app, secret `sb_secret_…` server-only if ever needed. The legacy
 * anon/service_role JWT keys were disabled in the dashboard 2026-07-11 and
 * the fallback removed (core D9).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
