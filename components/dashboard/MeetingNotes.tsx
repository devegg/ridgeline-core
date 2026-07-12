'use client'

import { useActionState } from 'react'
import { addMeetingNoteAction } from '@/app/actions/meeting-notes'
import type { ActionState } from '@/lib/types'

export interface MeetingNote {
  id: string
  noted_on: string
  note: string
}

/** A running, dated log of conversations — the "what did we say last time"
    answer. Evergreen facts still belong in relationship notes. */
export function MeetingNotesPanel({ clientId, notes }: { clientId: string; notes: MeetingNote[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addMeetingNoteAction, null)
  return (
    <div className="section-card">
      <div className="section-card__head">
        <span className="section-card__label">Meeting notes</span>
      </div>
      <div style={{ padding: '14px 22px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="hidden" name="client_id" value={clientId} />
          {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: '0 1 150px' }}>
              <label>Date</label>
              <input name="noted_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="field" style={{ flex: '1 1 260px' }}>
              <label>What was said / decided</label>
              <input name="note" required placeholder="Wants the intake build quoted after Labor Day" />
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn-primary" disabled={pending}>{pending ? 'Adding…' : 'Add'}</button>
            </div>
          </div>
        </form>
        {notes.length === 0 ? (
          <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>No meeting notes yet.</div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.map(n => (
              <li key={n.id} style={{ display: 'flex', gap: 12, fontSize: 13.5, lineHeight: 1.55 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap', paddingTop: 2 }}>{n.noted_on}</span>
                <span style={{ color: 'var(--ink-muted)' }}>{n.note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
