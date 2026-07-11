'use client'

import { useActionState } from 'react'
import { createRequestAction } from '@/app/actions/requests'
import type { ActionState } from '@/lib/types'

export function RequestForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createRequestAction, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{
          padding: '12px 16px', border: '1px solid var(--rule)', background: 'var(--paper)',
          fontSize: 14.5, color: 'var(--ink)',
        }}>
          {state.message}
        </div>
      )}

      <div className="field">
        <label htmlFor="req-title">What do you need?</label>
        <input id="req-title" name="title" type="text" placeholder="One sentence is plenty" required />
        {state?.errors?.title && (
          <span style={{ fontSize: 13, color: 'var(--amber-deep)' }}>{state.errors.title}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="req-detail">Anything else I should know? (optional)</label>
        <textarea id="req-detail" name="detail" rows={4} />
      </div>

      <div className="field">
        <label htmlFor="req-urgency">How urgent?</label>
        <select id="req-urgency" name="urgency" defaultValue="normal">
          <option value="low">Whenever — no rush</option>
          <option value="normal">Normal</option>
          <option value="high">This is costing us time or money</option>
        </select>
      </div>

      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send request'}
          {!pending && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}
