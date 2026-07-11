'use client'

import { useActionState } from 'react'
import { createRateAction, deleteRateAction } from '@/app/actions/billing'
import type { ActionState } from '@/lib/types'

// This page uses client components only — rates data fetched via server action patterns
// In a future pass we can split into server/client components
export default function RatesPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Billing · Rates</div>
        <h1 className="page-title">Billing Rates</h1>
        <p className="page-description">Day rates and fixed prices — no hourly (value and scope set the price; the day rate is the floor).</p>
      </div>
      <RatesClient />
    </div>
  )
}

function RatesClient() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createRateAction, null)

  return (
    <div>
      {state?.message && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 20 }}>
          {state.message}
        </div>
      )}

      {/* Add rate form */}
      <form action={formAction} className="form" style={{ maxWidth: 560, marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 16 }}>
          Add Rate
        </div>

        {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}

        <div className="field-row">
          <div className={`field ${state?.errors?.label ? 'field--error' : ''}`}>
            <label>Label *</label>
            <input name="label" type="text" placeholder="Standard day rate" required />
            {state?.errors?.label && <div className="field__error">{state.errors.label}</div>}
          </div>
          <div className={`field ${state?.errors?.rate ? 'field--error' : ''}`}>
            <label>Rate ($) *</label>
            <input name="rate" type="number" step="0.01" min="0" placeholder="150.00" required />
            {state?.errors?.rate && <div className="field__error">{state.errors.rate}</div>}
          </div>
        </div>

        <div className="field">
          <label>Type</label>
          <select name="rate_type" defaultValue="daily">
            <option value="daily">Daily</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="form__footer">
          <div />
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Adding…' : 'Add rate'}
            {!pending && <span className="arrow" />}
          </button>
        </div>
      </form>

      <div className="stub-notice">
        <div className="stub-notice__label">Note</div>
        <div className="stub-notice__body">
          The rates list will display here after the page is connected to real data in Phase 1b. The form above writes to the <code>billing_rates</code> table.
        </div>
      </div>
    </div>
  )
}
