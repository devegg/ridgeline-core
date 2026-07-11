import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase/keys'

/**
 * Machine ingest (n8n-shaped): upsert one daily activity rollup.
 *
 *   POST /api/ingest/activity
 *   Authorization: Bearer <client ingest key>
 *   { "automation_id": "<uuid>", "activity_on": "YYYY-MM-DD", "items_processed": 123 }
 *
 * Authorization happens INSIDE the database: the bounded SECURITY DEFINER
 * function ingest_activity() verifies the key's hash against the
 * automation's client and can touch nothing but that one rollup row.
 * activity_on defaults to today when omitted.
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!key) {
    return NextResponse.json({ error: 'missing bearer key' }, { status: 401 })
  }

  let body: { automation_id?: string; activity_on?: string; items_processed?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const automationId = body.automation_id
  const items = Number(body.items_processed)
  const on = body.activity_on ?? new Date().toISOString().slice(0, 10)
  if (!automationId || !Number.isFinite(items) || !/^\d{4}-\d{2}-\d{2}$/.test(on)) {
    return NextResponse.json(
      { error: 'expected { automation_id, items_processed, activity_on? (YYYY-MM-DD) }' },
      { status: 400 },
    )
  }

  // Sessionless anon client — the RPC carries its own authorization.
  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.rpc('ingest_activity', {
    p_key: key,
    p_automation: automationId,
    p_on: on,
    p_items: Math.round(items),
  })

  if (error) {
    // The function raises the same message for bad key / unknown automation.
    const status = /invalid key/i.test(error.message) ? 401 : 400
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json({ ok: true, automation_id: automationId, activity_on: on, items_processed: data })
}
