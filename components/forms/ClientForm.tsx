'use client'

import { useActionState } from 'react'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { IndustrySelect } from '@/components/forms/IndustrySelect'
import type { Client, ActionState } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'prospective', label: 'Prospective' },
  { value: 'past', label: 'Past' },
]

interface ClientFormProps {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  client?: Client
  submitLabel?: string
  industries?: string[]
}

export function ClientForm({ action, client, submitLabel = 'Save client', industries = [] }: ClientFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      {client && <input type="hidden" name="id" value={client.id} />}

      {state?.errors?._root && (
        <div className="login-error">{state.errors._root}</div>
      )}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', padding: '10px 0' }}>
          {state.message}
        </div>
      )}

      <div className={`field ${state?.errors?.name ? 'field--error' : ''}`}>
        <label htmlFor="cf-name">Client name *</label>
        <input id="cf-name" name="name" type="text" defaultValue={client?.name ?? ''} required />
        {state?.errors?.name && <div className="field__error">{state.errors.name}</div>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cf-contact">Primary contact</label>
          <input id="cf-contact" name="primary_contact" type="text" defaultValue={client?.primary_contact ?? ''} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="cf-status">Status</label>
          <select id="cf-status" name="status" defaultValue={client?.status ?? 'active'}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" defaultValue={client?.email ?? ''} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="cf-phone">Phone</label>
          <PhoneInput id="cf-phone" name="phone" defaultValue={client?.phone} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cf-industry">Industry</label>
          <IndustrySelect id="cf-industry" industries={industries} defaultValue={client?.industry} />
        </div>
        <div className="field">
          <label htmlFor="cf-location">Location</label>
          <input id="cf-location" name="location" type="text" defaultValue={client?.location ?? ''} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="cf-notes">Relationship notes</label>
        <textarea id="cf-notes" name="relationship_notes" defaultValue={client?.relationship_notes ?? ''} style={{ minHeight: 90 }} />
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
