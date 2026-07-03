import type { PostgrestError } from '@supabase/supabase-js'

// PostgREST code for `.single()` matching zero rows — an expected miss that
// pages handle with notFound(), not a broken query.
const MISSING_ROW = 'PGRST116'

/**
 * Logs any non-null Supabase error to the server console with its table name,
 * and reports whether the query genuinely failed (permissions, network, bad
 * SQL) as opposed to a `.single()` row simply not existing. Render an error
 * state when this returns true; fall through to notFound()/empty states when
 * it returns false.
 */
export function queryFailed(table: string, error: PostgrestError | null): boolean {
  if (!error) return false
  console.error(`[supabase:${table}] query failed: ${error.code} ${error.message}`)
  return error.code !== MISSING_ROW
}
