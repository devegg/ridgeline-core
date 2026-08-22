'use client'

import { useActionState } from 'react'
import { createPortalLoginAction, setPortalAccessAction } from '@/app/actions/portal-users'
import type { ActionState } from '@/lib/types'

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null
  return (
    <>
      {state.errors?._root && <div className="login-error" style={{ marginTop: 8 }}>{state.errors._root}</div>}
      {state.message && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--ink-muted)',
            wordBreak: 'break-word',
          }}
        >
          {state.message}
        </div>
      )}
    </>
  )
}

/**
 * Turn a portal login off or back on. Deliberately not a delete — the account
 * and its sign-in history survive, so the row can answer "were they cut off,
 * and when" later, and one click puts it back.
 */
export function AccessToggle({ userId, disabled }: { userId: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(setPortalAccessAction, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="disable" value={disabled ? 'false' : 'true'} />
      <button
        type="submit"
        disabled={pending}
        className={disabled ? 'btn-primary' : 'btn-outline'}
        style={{ fontSize: 12, padding: '5px 12px', whiteSpace: 'nowrap' }}
      >
        {pending ? 'Working…' : disabled ? 'Re-enable' : 'Disable access'}
      </button>
      <Feedback state={state} />
    </form>
  )
}

/**
 * Create the login for a client that has none. Reuses the same action the
 * per-client portal panel uses, so there is one provisioning path, not two.
 * The generated password is shown once and never again.
 */
export function CreateLogin({ clientId, defaultEmail }: { clientId: string; defaultEmail: string | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createPortalLoginAction, null)

  return (
    <details>
      <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--ink-muted)' }}>Create login</summary>
      <form action={formAction} style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="hidden" name="client_id" value={clientId} />
        <input
          type="email"
          name="email"
          required
          defaultValue={defaultEmail ?? ''}
          placeholder="their@address.com"
          style={{ maxWidth: 230, fontSize: 13 }}
        />
        <button type="submit" className="btn-primary" disabled={pending} style={{ fontSize: 12, padding: '5px 12px' }}>
          {pending ? 'Creating…' : 'Create'}
        </button>
      </form>
      <Feedback state={state} />
    </details>
  )
}
