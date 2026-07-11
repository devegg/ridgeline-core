import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase/keys'

/**
 * Machine-reported issues (n8n error paths): file a caught-issues row with
 * the same per-client bearer key as activity ingest. `status: "active"`
 * ambers the client's health banner until the owner resolves it.
 *
 *   POST /api/ingest/issue
 *   Authorization: Bearer <client ingest key>
 *   { "summary": "...", "detail"?: "...", "automation_id"?: "<uuid>", "status"?: "active"|"resolved" }
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!key) return NextResponse.json({ error: 'missing bearer key' }, { status: 401 })

  let body: { summary?: string; detail?: string; automation_id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
  if (!body.summary?.trim()) {
    return NextResponse.json({ error: 'summary is required' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.rpc('ingest_issue', {
    p_key: key,
    p_summary: body.summary.trim(),
    p_detail: body.detail ?? null,
    p_automation: body.automation_id ?? null,
    p_status: body.status === 'resolved' ? 'resolved' : 'active',
  })

  if (error) {
    const status = /invalid key/i.test(error.message) ? 401 : 400
    return NextResponse.json({ error: error.message }, { status })
  }
  return NextResponse.json({ ok: true, issue_id: data })
}
