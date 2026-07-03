'use client'

import { useActionState } from 'react'
import type { Project, Client, ActionState } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
]

interface ProjectFormProps {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  project?: Project
  clients: Pick<Client, 'id' | 'name'>[]
  defaultClientId?: string
  submitLabel?: string
}

export function ProjectForm({ action, project, clients, defaultClientId, submitLabel = 'Save project' }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="form" style={{ maxWidth: 680 }}>
      {project && <input type="hidden" name="id" value={project.id} />}

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', padding: '10px 0' }}>
          {state.message}
        </div>
      )}

      <div className={`field ${state?.errors?.name ? 'field--error' : ''}`}>
        <label htmlFor="pf-name">Project name *</label>
        <input id="pf-name" name="name" type="text" defaultValue={project?.name ?? ''} required />
        {state?.errors?.name && <div className="field__error">{state.errors.name}</div>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="pf-client">Client</label>
          <select id="pf-client" name="client_id" defaultValue={project?.client_id ?? defaultClientId ?? ''}>
            <option value="">— none —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-status">Status</label>
          <select id="pf-status" name="status" defaultValue={project?.status ?? 'active'}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="pf-description">Description</label>
        <input id="pf-description" name="description" type="text" defaultValue={project?.description ?? ''} />
      </div>

      <div className="field">
        <label htmlFor="pf-scope">Scope</label>
        <textarea id="pf-scope" name="scope" defaultValue={project?.scope ?? ''} style={{ minHeight: 80 }} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="pf-start">Start date</label>
          <input id="pf-start" name="start_date" type="date" defaultValue={project?.start_date ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="pf-end">Target end date</label>
          <input id="pf-end" name="end_date" type="date" defaultValue={project?.end_date ?? ''} />
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
