'use client'

import { useActionState } from 'react'
import { approveProposalClientAction } from '@/app/actions/portal-proposals'
import type { ActionState } from '@/lib/types'

export function ApproveProposal({ proposalId }: { proposalId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(approveProposalClientAction, null)

  if (state?.message) {
    return (
      <div style={{ marginTop: 14, padding: '12px 16px', border: '1px solid var(--rule)', background: 'var(--paper)', fontSize: 14.5 }}>
        {state.message}
      </div>
    )
  }

  return (
    <form action={formAction} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="proposal_id" value={proposalId} />
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Approving…' : 'Approve this proposal'}
          {!pending && <span className="arrow" />}
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: 0 }}>
        Approving records your go-ahead with a timestamp. Questions first? Use Requests —
        nothing moves until you're comfortable.
      </p>
    </form>
  )
}
