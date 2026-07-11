'use client'

import { useActionState, useState } from 'react'
import type { Proposal, Client, Project, ActionState, ProposalCarePlan } from '@/lib/types'

const DEFAULT_CARE_PLAN: ProposalCarePlan = {
  included: true,
  note: 'Every build includes its first 60 days of care at no charge; the plan below continues month to month after that, cancel anytime.',
  tiers: [
    { name: 'Watch', price: '', summary: 'Monitoring, error alerts, fixes when something breaks, and the monthly report.' },
    { name: 'Improve', price: '', summary: 'Everything in Watch, plus one enhancement like the ones on your roadmap each month.' },
    { name: 'Own', price: '', summary: 'Everything in Improve, with continuous improvement work and first-priority response.' },
  ],
}

interface ProposalFormProps {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  proposal?: Proposal
  clients: Pick<Client, 'id' | 'name'>[]
  projects: Pick<Project, 'id' | 'name'>[]
  submitLabel?: string
}

export function ProposalForm({ action, proposal, clients, projects, submitLabel = 'Save proposal' }: ProposalFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)
  const [carePlan, setCarePlan] = useState<ProposalCarePlan>(proposal?.care_plan ?? DEFAULT_CARE_PLAN)
  const setTier = (i: number, key: 'name' | 'price' | 'summary', value: string) =>
    setCarePlan(cp => ({ ...cp, tiers: cp.tiers.map((t, j) => (j === i ? { ...t, [key]: value } : t)) }))

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

      <input type="hidden" name="care_plan" value={JSON.stringify(carePlan)} />
      <div style={{ border: '1px solid var(--rule)', background: 'var(--bg)', padding: '14px 16px' }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          <input type="checkbox" checked={carePlan.included}
            onChange={e => setCarePlan(cp => ({ ...cp, included: e.target.checked }))} />
          Include the Care Plan (opt-out line item)
        </label>
        {carePlan.included && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea value={carePlan.note} rows={2} style={{ fontSize: 13.5 }}
              onChange={e => setCarePlan(cp => ({ ...cp, note: e.target.value }))} />
            {carePlan.tiers.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 110px 1fr', gap: 8 }}>
                <input value={t.name} placeholder="Tier" onChange={e => setTier(i, 'name', e.target.value)} style={{ fontSize: 13.5 }} />
                <input value={t.price} placeholder="$/mo" onChange={e => setTier(i, 'price', e.target.value)} style={{ fontSize: 13.5, fontFamily: 'var(--mono)' }} />
                <input value={t.summary} placeholder="What it covers" onChange={e => setTier(i, 'summary', e.target.value)} style={{ fontSize: 13.5 }} />
              </div>
            ))}
          </div>
        )}
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
