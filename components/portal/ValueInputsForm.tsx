'use client'

import { useActionState } from 'react'
import { updateValueInputsAction } from '@/app/actions/portal-value'
import type { ActionState, Automation } from '@/lib/types'

/** "Your numbers" — the client owns the savings math's inputs: their blended
    hourly rate and the minutes each task took by hand before automation.
    Owners see it read-only in preview (the action is client-gated anyway). */
export function ValueInputsForm({
  rate,
  automations,
  viewerIsClient,
}: {
  rate: number
  automations: Pick<Automation, 'id' | 'name' | 'baseline_minutes_per_item'>[]
  viewerIsClient: boolean
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateValueInputsAction, null)

  return (
    <form action={formAction} className="value-inputs">
      <div className="value-inputs__head">Your numbers</div>
      <p className="value-inputs__note">
        These savings run on numbers you control. Set the hourly cost you&rsquo;d put on your
        team&rsquo;s time, and how long each task really took by hand — I&rsquo;ll still cut the
        total by 30% so it stays on the safe side.
      </p>

      <div className="value-inputs__field">
        <label htmlFor="vi-rate">Your blended hourly rate</label>
        <div className="value-inputs__money">
          <span>$</span>
          <input
            id="vi-rate"
            name="rate"
            type="number"
            min={5}
            max={500}
            step="1"
            defaultValue={Math.round(rate)}
            disabled={!viewerIsClient}
            required
          />
          <span>/hour</span>
        </div>
      </div>

      {automations.map((a) => (
        <div className="value-inputs__field" key={a.id}>
          <label htmlFor={`vi-${a.id}`}>{a.name.split(':')[0]} — minutes per item, by hand</label>
          <input
            id={`vi-${a.id}`}
            name={`minutes-${a.id}`}
            type="number"
            min={0.5}
            max={480}
            step="0.5"
            defaultValue={Number(a.baseline_minutes_per_item)}
            disabled={!viewerIsClient}
            required
          />
        </div>
      ))}

      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && <div className="value-inputs__saved">{state.message}</div>}

      {viewerIsClient ? (
        <div>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save my numbers'}
          </button>
        </div>
      ) : (
        <p className="value-inputs__owner-note">
          Owner preview — the client sets these from their own login.
        </p>
      )}
    </form>
  )
}
