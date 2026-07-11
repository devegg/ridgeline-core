'use client'

import { useActionState } from 'react'
import { createDeliverableAction } from '@/app/actions/deliverables'
import type { ActionState } from '@/lib/types'

/** The create form the deliverables action was always waiting for —
    lives on the project page (a deliverable belongs to a build). */
export function DeliverableForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createDeliverableAction, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', borderTop: '1px solid var(--rule-soft)' }}>
      <input type="hidden" name="project_id" value={projectId} />
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber-deep)' }}>
          {state.message}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '1 1 220px' }}>
          <label>New deliverable</label>
          <input name="title" placeholder="Handoff doc: how the booking sync works" required />
          {state?.errors?.title && <span className="field__error">{state.errors.title}</span>}
        </div>
        <div className="field" style={{ flex: '0 1 150px' }}>
          <label>Due</label>
          <input name="due_date" type="date" />
        </div>
        <div style={{ paddingBottom: 2 }}>
          <button className="btn-primary" disabled={pending} style={{ fontSize: 13, padding: '8px 16px' }}>
            {pending ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
      <div className="field">
        <label>Description (optional)</label>
        <input name="description" />
      </div>
    </form>
  )
}
