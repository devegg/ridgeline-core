'use client'

import { useState } from 'react'

/** Formats US phone numbers as (000) 000-0000 while typing. Submits the
    formatted string; strips everything but digits internally. */
export function PhoneInput({ name, defaultValue, id }: { name: string; defaultValue?: string | null; id?: string }) {
  const format = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    if (d.length === 0) return ''
    if (d.length < 4) return `(${d}`
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  const [value, setValue] = useState(format(defaultValue ?? ''))
  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="numeric"
      placeholder="(000) 000-0000"
      value={value}
      onChange={(e) => setValue(format(e.target.value))}
    />
  )
}
