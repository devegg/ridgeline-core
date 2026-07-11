'use client'

import { useState } from 'react'

/** Single-select over the owner-managed industries list, with an inline
    "+ Add new" option that swaps to a text input. New values are persisted
    to the list by the save action (upsert on submit). */
export function IndustrySelect({ industries, defaultValue, id }: {
  industries: string[]
  defaultValue?: string | null
  id?: string
}) {
  const known = defaultValue && industries.includes(defaultValue)
  const [adding, setAdding] = useState(!!defaultValue && !known)

  if (adding) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input id={id} name="industry" type="text" autoFocus
          defaultValue={known ? '' : defaultValue ?? ''} placeholder="New industry" style={{ flex: 1 }} />
        <button type="button" onClick={() => setAdding(false)}
          style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-soft)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Pick from list
        </button>
      </div>
    )
  }

  return (
    <select
      id={id}
      name="industry"
      defaultValue={known ? defaultValue! : ''}
      onChange={(e) => { if (e.target.value === '__add__') setAdding(true) }}
    >
      <option value="">— none —</option>
      {industries.map(i => <option key={i} value={i}>{i}</option>)}
      <option value="__add__">+ Add new…</option>
    </select>
  )
}
