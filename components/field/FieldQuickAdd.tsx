'use client'

import { useActionState, useState } from 'react'
import { addFieldProspectAction } from '@/app/actions/prospects'
import { noAutofill } from '@/lib/field/no-autofill'
import type { ActionState } from '@/lib/types'

/**
 * No card, no problem. Someone meets you at the desk and gives you a name —
 * this is where it goes. Collapsed by default so the camera stays the
 * obvious first move; saving jumps straight into the visit screen.
 */
export function FieldQuickAdd() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addFieldProspectAction, null)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button type="button" className="field-addbiz" onClick={() => setOpen(true)}>
        No card? Add the business by hand
      </button>
    )
  }

  return (
    <form action={formAction} className="field-scan">
      {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}

      <label className="field-label">
        Business
        <input name="business_name" className="field-input" {...noAutofill} required autoFocus />
      </label>
      <label className="field-label">
        Who you&rsquo;re talking to
        <input name="contact_name" className="field-input" {...noAutofill} placeholder="Name, and their job if you got it" />
      </label>
      <label className="field-label">
        Phone
        <input name="phone" type="tel" className="field-input" {...noAutofill} />
      </label>
      <label className="field-label">
        Email
        <input name="email" type="email" className="field-input" {...noAutofill} />
      </label>
      <label className="field-label">
        Notes
        <input name="notes" className="field-input" {...noAutofill} placeholder="What they said, what happens next" />
      </label>

      <button type="submit" className="field-submit" disabled={pending}>
        {pending ? 'Saving…' : 'Add and start the visit'}
      </button>
      <button type="button" className="field-linkbtn" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  )
}
