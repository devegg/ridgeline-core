'use client'

import { useActionState } from 'react'
import {
  addProspectAction, importKmlAction, logVisitAction, promoteToLeadAction, setProspectStatusAction,
} from '@/app/actions/prospects'
import type { ActionState, Prospect, ProspectVisit } from '@/lib/types'

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

/** Quick add — built for a phone in a parking lot: name + industry is enough. */
export function ProspectQuickAdd({ industries }: { industries: string[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addProspectAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Feedback state={state} />
      <div className="field">
        <label>Business name</label>
        <input name="business_name" required autoComplete="off" />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: '1 1 180px' }}>
          <label>Industry</label>
          <input name="industry" list="prospect-industries" autoComplete="off" />
          <datalist id="prospect-industries">
            {industries.map(i => <option key={i} value={i} />)}
          </datalist>
        </div>
        <div className="field" style={{ flex: '1 1 180px' }}>
          <label>Phone (optional)</label>
          <input name="phone" type="tel" />
        </div>
      </div>
      <div className="field">
        <label>Address (optional)</label>
        <input name="address" />
      </div>
      <div className="field">
        <label>Notes (optional)</label>
        <input name="notes" placeholder="Front desk busy, owner in Tuesdays" />
      </div>
      <div>
        <button className="btn-primary" disabled={pending}>{pending ? 'Adding…' : 'Add prospect'}</button>
      </div>
    </form>
  )
}

/** Map import — the Grand Strand Drop-Ins My Map, exported as KML. */
export function KmlImport() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(importKmlAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 13.5, color: 'var(--ink-muted)', margin: 0, maxWidth: '62ch', lineHeight: 1.6 }}>
        In Google My Maps: the ⋮ menu next to the map title → <b>Export to KML/KMZ</b> →
        check <b>&ldquo;Export as KML instead of KMZ&rdquo;</b> → download, then pick the file here.
        Layers become industries; re-importing skips pins already in the list.
      </p>
      <Feedback state={state} />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="kml" type="file" accept=".kml,application/vnd.google-earth.kml+xml" required style={{ fontSize: 13.5 }} />
        <button className="btn-primary" disabled={pending}>{pending ? 'Importing…' : 'Import map'}</button>
      </div>
    </form>
  )
}

function LogVisit({ prospectId }: { prospectId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(logVisitAction, null)
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
      <input type="hidden" name="prospect_id" value={prospectId} />
      <Feedback state={state} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: '0 1 150px' }}>
          <label>Date</label>
          <input name="visited_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field" style={{ flex: '0 1 130px' }}>
          <label>Card word</label>
          <input name="card_word" placeholder="vrm" autoComplete="off" />
        </div>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label>Note</label>
          <input name="note" placeholder="Spoke with the office manager" />
        </div>
      </div>
      <div>
        <button className="btn-primary" disabled={pending} style={{ fontSize: 13, padding: '8px 16px' }}>
          {pending ? 'Logging…' : 'Log visit'}
        </button>
      </div>
    </form>
  )
}

function Promote({ prospectId }: { prospectId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(promoteToLeadAction, null)
  return (
    <form action={formAction} style={{ display: 'inline' }}>
      <input type="hidden" name="prospect_id" value={prospectId} />
      {state?.errors?._root && <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginRight: 8 }}>{state.errors._root}</span>}
      <button className="btn-outline" disabled={pending} style={{ fontSize: 12, padding: '6px 14px' }}>
        {pending ? 'Promoting…' : 'Promote to lead'}
      </button>
    </form>
  )
}

function Archive({ prospectId }: { prospectId: string }) {
  const [, formAction, pending] = useActionState<ActionState, FormData>(setProspectStatusAction, null)
  return (
    <form action={formAction} style={{ display: 'inline' }}>
      <input type="hidden" name="prospect_id" value={prospectId} />
      <input type="hidden" name="status" value="archived" />
      <button className="btn-outline" disabled={pending} style={{ fontSize: 12, padding: '6px 14px', color: 'var(--ink-soft)' }}>
        Archive
      </button>
    </form>
  )
}

const STATUS_LABEL: Record<string, string> = {
  untouched: 'Untouched',
  visited: 'Visited',
  interested: 'Interested',
  lead: 'Lead ✓',
  archived: 'Archived',
}

/** One prospect, phone-first: everything stacks, actions inside a details fold. */
export function ProspectCard({ prospect, visits }: { prospect: Prospect; visits: ProspectVisit[] }) {
  return (
    <details className="prospect-card">
      <summary>
        <span className="prospect-card__name">{prospect.business_name}</span>
        <span className="prospect-card__meta">
          {prospect.industry && <span>{prospect.industry}</span>}
          <span className={`prospect-card__status prospect-card__status--${prospect.status}`}>
            {STATUS_LABEL[prospect.status] ?? prospect.status}
          </span>
          {visits.length > 0 && <span>{visits.length} visit{visits.length === 1 ? '' : 's'}</span>}
        </span>
      </summary>
      <div className="prospect-card__body">
        {prospect.address && <div style={{ fontSize: 13.5, color: 'var(--ink-muted)' }}>{prospect.address}</div>}
        {prospect.phone && (
          <div style={{ fontSize: 13.5 }}>
            <a href={`tel:${prospect.phone.replace(/\D/g, '')}`}>{prospect.phone}</a>
          </div>
        )}
        {prospect.notes && <div style={{ fontSize: 13.5, color: 'var(--ink-muted)' }}>{prospect.notes}</div>}
        {visits.length > 0 && (
          <ul className="prospect-card__visits">
            {visits.map(v => (
              <li key={v.id}>
                <span>{v.visited_on}</span>
                {v.card_word && <span className="prospect-card__word">/{v.card_word.replace(/^\//, '')}</span>}
                {v.note && <span>{v.note}</span>}
              </li>
            ))}
          </ul>
        )}
        {prospect.status !== 'lead' && prospect.status !== 'archived' && (
          <>
            <LogVisit prospectId={prospect.id} />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Promote prospectId={prospect.id} />
              <Archive prospectId={prospect.id} />
            </div>
          </>
        )}
      </div>
    </details>
  )
}
