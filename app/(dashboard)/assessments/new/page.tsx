'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createAssessmentAction } from '@/app/actions/assessments'
import type { ActionState } from '@/lib/types'

// Loaded server-side, clients/projects passed as props via a server wrapper
export default function NewAssessmentPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Assessments · New</div>
        <h1 className="page-title">Create Assessment</h1>
      </div>
      <AssessmentFormWrapper />
      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/assessments" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to assessments</Link>
      </p>
    </div>
  )
}

function AssessmentFormWrapper() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createAssessmentAction, null)
  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      <div className={`field ${state?.errors?.title ? 'field--error' : ''}`}>
        <label htmlFor="af-title">Assessment title *</label>
        <input id="af-title" name="title" type="text" required />
        {state?.errors?.title && <div className="field__error">{state.errors.title}</div>}
      </div>
      <div className="field">
        <label htmlFor="af-date">Scheduled date</label>
        <input id="af-date" name="scheduled_date" type="date" />
      </div>
      <div className="form__footer">
        <div className="form__note">Client and project can be added from the detail page.</div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Creating…' : 'Create assessment'}
          {!pending && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}
