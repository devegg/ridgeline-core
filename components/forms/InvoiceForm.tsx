'use client'

import { useActionState, useState } from 'react'
import type { Invoice, Client, Project, LineItem, ActionState } from '@/lib/types'

interface InvoiceFormProps {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>
  invoice?: Invoice
  clients: Pick<Client, 'id' | 'name'>[]
  projects: Pick<Project, 'id' | 'name'>[]
  submitLabel?: string
}

const emptyLine = (): LineItem => ({ description: '', quantity: 1, rate: 0, amount: 0 })

export function InvoiceForm({ action, invoice, clients, projects, submitLabel = 'Save invoice' }: InvoiceFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null)
  const [lines, setLines] = useState<LineItem[]>(invoice?.line_items?.length ? invoice.line_items : [emptyLine()])

  const updateLine = (i: number, field: keyof LineItem, raw: string) => {
    setLines(prev => {
      const next = [...prev]
      const val = field === 'description' ? raw : parseFloat(raw) || 0
      next[i] = { ...next[i], [field]: val }
      if (field === 'quantity' || field === 'rate') {
        next[i].amount = next[i].quantity * next[i].rate
      }
      return next
    })
  }

  const total = lines.reduce((s, l) => s + (l.amount || 0), 0)

  return (
    <form action={formAction} className="form" style={{ maxWidth: 720 }}>
      {invoice && <input type="hidden" name="id" value={invoice.id} />}
      <input type="hidden" name="line_items" value={JSON.stringify(lines)} />

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', padding: '10px 0' }}>
          {state.message}
        </div>
      )}

      <div className="field-row">
        <div className={`field ${state?.errors?.client_id ? 'field--error' : ''}`}>
          <label>Client *</label>
          <select name="client_id" defaultValue={invoice?.client_id ?? ''} required>
            <option value="">— select client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {state?.errors?.client_id && <div className="field__error">{state.errors.client_id}</div>}
        </div>
        <div className="field">
          <label>Project (optional)</label>
          <select name="project_id" defaultValue={invoice?.project_id ?? ''}>
            <option value="">— none —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Invoice #</label>
          <input name="invoice_number" type="text" defaultValue={invoice?.invoice_number ?? ''} placeholder="INV-001" />
        </div>
        <div className="field">
          <label>Due date</label>
          <input name="due_date" type="date" defaultValue={invoice?.due_date ?? ''} />
        </div>
      </div>

      {/* Line items */}
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>Line Items</div>
        <div style={{ border: '1px solid var(--rule)', background: 'var(--bg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 36px', gap: 0, borderBottom: '1px solid var(--rule)', padding: '8px 12px' }}>
            {['Description', 'Qty', 'Rate', 'Amount', ''].map(h => (
              <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{h}</div>
            ))}
          </div>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 36px', gap: 8, padding: '10px 12px', borderBottom: i < lines.length - 1 ? '1px solid var(--rule-soft)' : 'none', alignItems: 'center' }}>
              <input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Description" style={{ fontSize: 14, border: 'none', background: 'transparent', borderBottom: '1px solid var(--rule)', padding: '4px 0', outline: 'none', color: 'var(--ink)' }} />
              <input value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} type="number" min="0" step="0.5" style={{ fontSize: 13, border: 'none', background: 'transparent', borderBottom: '1px solid var(--rule)', padding: '4px 0', outline: 'none', color: 'var(--ink)', fontFamily: 'var(--mono)', textAlign: 'right' }} />
              <input value={line.rate} onChange={e => updateLine(i, 'rate', e.target.value)} type="number" min="0" step="0.01" style={{ fontSize: 13, border: 'none', background: 'transparent', borderBottom: '1px solid var(--rule)', padding: '4px 0', outline: 'none', color: 'var(--ink)', fontFamily: 'var(--mono)', textAlign: 'right' }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)', textAlign: 'right' }}>${line.amount.toFixed(2)}</div>
              <button type="button" onClick={() => setLines(l => l.filter((_, j) => j !== i))} style={{ fontSize: 16, color: 'var(--ink-soft)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>×</button>
            </div>
          ))}
          <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--rule)' }}>
            <button type="button" onClick={() => setLines(l => [...l, emptyLine()])} className="btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>+ Add line</button>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', letterSpacing: '0.06em' }}>
              Total: <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea name="notes" defaultValue={invoice?.notes ?? ''} style={{ minHeight: 60 }} />
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
