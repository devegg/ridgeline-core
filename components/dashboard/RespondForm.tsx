'use client'

import { useActionState } from 'react'
import { respondToRequestAction } from '@/app/actions/requests'
import type { ActionState, ChangeRequest } from '@/lib/types'

export function RespondForm({ request }: { request: ChangeRequest }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(respondToRequestAction, null)

  return (
    <form action={formAction} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name="id" value={request.id} />
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber-deep)' }}>
          {state.message}
        </div>
      )}

      <div className="field">
        <label htmlFor={`response-${request.id}`}>Written reply (shows in the client portal)</label>
        <textarea
          id={`response-${request.id}`}
          name="response"
          rows={3}
          defaultValue={request.response ?? ''}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select name="status" defaultValue={request.status} style={{ maxWidth: 180 }}>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save reply'}
        </button>
      </div>
    </form>
  )
}
