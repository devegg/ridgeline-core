'use client'

import { useActionState } from 'react'
import { updateAssessmentAction } from '@/app/actions/assessments'
import type { ActionState, Assessment } from '@/lib/types'

export function AssessmentForm({ a, clients, projects }: {
  a: Assessment
  clients: { id: string; name: string }[]
  projects: { id: string; name: string }[]
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateAssessmentAction, null)

  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      <input type="hidden" name="id" value={a.id} />

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}

      <div className={`field ${state?.errors?.title ? 'field--error' : ''}`}>
        <label>Title *</label>
        <input name="title" defaultValue={a.title} required />
        {state?.errors?.title && <div className="field__error">{state.errors.title}</div>}
      </div>
      <div className="field-row">
        <div className="field">
          <label>Client</label>
          <select name="client_id" defaultValue={a.client_id ?? ''}>
            <option value="">— none —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Project</label>
          <select name="project_id" defaultValue={a.project_id ?? ''}>
            <option value="">— none —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Scheduled Date</label>
        <input name="scheduled_date" type="date" defaultValue={a.scheduled_date ?? ''} />
      </div>
      <div className="field">
        <label>Findings</label>
        <textarea name="findings" defaultValue={a.findings ?? ''} style={{ minHeight: 90 }} />
      </div>
      <div className="field">
        <label>Recommendations</label>
        <textarea name="recommendations" defaultValue={a.recommendations ?? ''} style={{ minHeight: 90 }} />
      </div>
      <div className="form__footer">
        <div className="form__note">Saving returns you to the assessment.</div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'} {!pending && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}
