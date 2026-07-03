'use client'

import { useActionState } from 'react'
import type { Proposal, Client, Project, ActionState } from '@/lib/types'

interface ProposalFormProps {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  proposal?: Proposal
  clients: Pick<Client, 'id' | 'name'>[]
  projects: Pick<Project, 'id' | 'name'>[]
  submitLabel?: string
}

export function ProposalForm({ action, proposal, clients, projects, submitLabel = 'Save proposal' }: ProposalFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      {proposal && <input type="hidden" name="id" value={proposal.id} />}

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', padding: '10px 0' }}>
          {state.message}
        </div>
      )}

      <div className={`field ${state?.errors?.title ? 'field--error' : ''}`}>
        <label htmlFor="prf-title">Proposal title *</label>
        <input id="prf-title" name="title" type="text" defaultValue={proposal?.title ?? ''} required />
        {state?.errors?.title && <div className="field__error">{state.errors.title}</div>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="prf-client">Client</label>
          <select id="prf-client" name="client_id" defaultValue={proposal?.client_id ?? ''}>
            <option value="">— none —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="prf-project">Project (optional)</label>
          <select id="prf-project" name="project_id" defaultValue={proposal?.project_id ?? ''}>
            <option value="">— none —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="prf-scope">Scope</label>
        <textarea id="prf-scope" name="scope" defaultValue={proposal?.scope ?? ''} style={{ minHeight: 100 }} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="prf-pricing">Pricing notes</label>
          <input id="prf-pricing" name="pricing_notes" type="text" defaultValue={proposal?.pricing_notes ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="prf-total">Total amount ($)</label>
          <input id="prf-total" name="total_amount" type="number" step="0.01" min="0" defaultValue={proposal?.total_amount ?? ''} />
        </div>
      </div>

      <div className="form__footer">
        <div className="form__note">* Required field</div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
          {!pending && <span className="arrow" />}
        </button>
      </div>
    </form>
  )
}
