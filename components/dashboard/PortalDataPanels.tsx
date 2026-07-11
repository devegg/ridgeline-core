'use client'

import { useActionState } from 'react'
import {
  addActivityAction, addHighlightAction, addIssueAction, addRoadmapAction,
  rotateIngestKeyAction, saveAutomationAction,
} from '@/app/actions/portal-data'
import type { ActionState, Automation } from '@/lib/types'

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null
  if (state.errors?._root) return <div className="login-error">{state.errors._root}</div>
  if (state.message) {
    return (
      <div style={{ padding: '10px 14px', border: '1px solid var(--rule)', background: 'var(--paper)', fontSize: 13.5 }}>
        {state.message}
      </div>
    )
  }
  return null
}

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }
const grow: React.CSSProperties = { flex: '1 1 220px' }
const small: React.CSSProperties = { flex: '0 1 140px' }

// ------------------------------------------------------------
export function AutomationForm({ clientId, automation }: { clientId: string; automation?: Automation }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveAutomationAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      {automation && <input type="hidden" name="id" value={automation.id} />}
      <Feedback state={state} />
      <div style={row}>
        <div className="field" style={grow}>
          <label>Name (plain language)</label>
          <input name="name" defaultValue={automation?.name ?? ''} placeholder="Booking sync: reservations to the books" required />
        </div>
        <div className="field" style={small}>
          <label>Minutes per item</label>
          <input name="baseline_minutes_per_item" type="number" step="0.5" min="0.5"
            defaultValue={automation ? Number(automation.baseline_minutes_per_item) : ''} required />
        </div>
        <div className="field" style={small}>
          <label>Status</label>
          <select name="status" defaultValue={automation?.status ?? 'running'}>
            <option value="running">Running</option>
            <option value="issue">Issue</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <div className="field" style={small}>
          <label>Started</label>
          <input name="started_on" type="date" defaultValue={automation?.started_on ?? ''} />
        </div>
      </div>
      <div className="field">
        <label>What it does (one sentence, client-facing)</label>
        <input name="plain_summary" defaultValue={automation?.plain_summary ?? ''} />
      </div>
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? 'Saving…' : automation ? 'Save changes' : 'Add automation'}</button>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
export function ActivityQuickAdd({ clientId, automations }: { clientId: string; automations: Automation[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addActivityAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Feedback state={state} />
      <div style={row}>
        <div className="field" style={grow}>
          <label>Automation</label>
          <select name="automation_id" required defaultValue="">
            <option value="" disabled>Pick one</option>
            {automations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="field" style={small}>
          <label>Date</label>
          <input name="activity_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field" style={small}>
          <label>Items processed</label>
          <input name="items_processed" type="number" min="0" required />
        </div>
        <div style={{ paddingBottom: 2 }}>
          <button className="btn-primary" disabled={pending}>{pending ? 'Recording…' : 'Record'}</button>
        </div>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
export function IssueForm({ clientId, automations }: { clientId: string; automations: Automation[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addIssueAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Feedback state={state} />
      <div className="field">
        <label>Summary (client-facing, plain words)</label>
        <input name="summary" placeholder="Caught 3 orders that didn't sync and re-sent them." required />
      </div>
      <div style={row}>
        <div className="field" style={grow}>
          <label>Automation (optional)</label>
          <select name="automation_id" defaultValue="">
            <option value="">—</option>
            {automations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="field" style={small}>
          <label>Date</label>
          <input name="occurred_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field" style={small}>
          <label>State</label>
          <select name="status" defaultValue="resolved">
            <option value="resolved">Caught &amp; fixed</option>
            <option value="active">Active (ambers the banner)</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Detail (optional)</label>
        <input name="detail" />
      </div>
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? 'Adding…' : 'Add issue'}</button>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
export function RoadmapForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addRoadmapAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Feedback state={state} />
      <div style={row}>
        <div className="field" style={grow}>
          <label>Title</label>
          <input name="title" placeholder="Weekly owner-payout summary email" required />
        </div>
        <div className="field" style={small}>
          <label>State</label>
          <select name="state" defaultValue="next">
            <option value="next">Next up</option>
            <option value="in_progress">In progress</option>
            <option value="shipped">Just shipped</option>
          </select>
        </div>
        <div style={{ paddingBottom: 2 }}>
          <button className="btn-primary" disabled={pending}>{pending ? 'Adding…' : 'Add'}</button>
        </div>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
export function HighlightForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addHighlightAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Feedback state={state} />
      <div style={row}>
        <div className="field" style={grow}>
          <label>Peace-of-mind line (no numbers — those live in the scoreboard)</label>
          <input name="line" placeholder="You haven't had to re-type a reservation since February." required />
        </div>
        <div style={{ paddingBottom: 2 }}>
          <button className="btn-primary" disabled={pending}>{pending ? 'Adding…' : 'Add'}</button>
        </div>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
export function IngestKeyPanel({ clientId, createdAt }: { clientId: string; createdAt: string | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(rotateIngestKeyAction, null)
  const freshKey = state?.message // plaintext, shown once

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 14, color: 'var(--ink-muted)', maxWidth: '68ch', lineHeight: 1.6 }}>
        The ingest key lets this client&rsquo;s automations (n8n or anything that can
        POST JSON) record daily activity. Only a hash is stored — the key shows ONCE
        when generated. Rotating kills the old key immediately.
        {createdAt && <> Current key created {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.</>}
      </p>
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {freshKey && (
        <div style={{ padding: '14px 18px', border: '1px solid var(--amber)', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber-deep)', marginBottom: 8 }}>
            Copy this now — it will not be shown again
          </div>
          <code style={{ fontFamily: 'var(--mono)', fontSize: 13, wordBreak: 'break-all' }}>{freshKey}</code>
          <pre style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 11.5, whiteSpace: 'pre-wrap', color: 'var(--ink-muted)' }}>{`curl -X POST https://www.ridgelineknows.com/api/ingest/activity \\
  -H "Authorization: Bearer ${freshKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"automation_id":"<uuid>","items_processed":42}'`}</pre>
        </div>
      )}
      <form action={formAction}>
        <input type="hidden" name="client_id" value={clientId} />
        <button className="btn-primary" disabled={pending}>
          {pending ? 'Working…' : createdAt ? 'Rotate key' : 'Generate key'}
        </button>
      </form>
    </div>
  )
}
