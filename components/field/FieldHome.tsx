'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FieldCardScan } from '@/components/field/FieldCardScan'
import type { Prospect } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  untouched: 'Not visited',
  visited: 'Visited',
  interested: 'Interested',
}

/**
 * Phone-first list of businesses worth walking into. Two things only: snap a
 * card, or tap a business to start pricing its tasks. Search is client-side —
 * the working list is short and a round-trip per keystroke in a parking lot
 * with one bar is worse than filtering in memory.
 */
export function FieldHome({ prospects }: { prospects: Prospect[] }) {
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return prospects
    return prospects.filter(p =>
      [p.business_name, p.industry, p.address, p.contact_name]
        .some(v => v?.toLowerCase().includes(needle))
    )
  }, [prospects, q])

  return (
    <div className="field-screen">
      <header className="field-head">
        <div className="field-eyebrow">Field kit</div>
        <h1 className="field-title">Card drops</h1>
        <p className="field-sub">
          {prospects.length} business{prospects.length === 1 ? '' : 'es'} still open.
        </p>
      </header>

      <FieldCardScan prospects={prospects.map(p => ({ id: p.id, business_name: p.business_name }))} />

      <input
        type="search"
        className="field-input field-search"
        placeholder="Find a business"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      {shown.length === 0 ? (
        <p className="field-empty">
          {q ? `Nothing matching “${q}”.` : 'Nothing open right now.'}
        </p>
      ) : (
        <ul className="field-plist">
          {shown.map(p => (
            <li key={p.id}>
              <Link href={`/visit/${p.id}`} className="field-plist__item">
                <span className="field-plist__name">{p.business_name}</span>
                <span className="field-plist__meta">
                  <span className={`field-pill field-pill--${p.status}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.industry && <span>{p.industry}</span>}
                </span>
                {p.address && <span className="field-plist__addr">{p.address}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="field-foot">
        <Link href="/prospects">Full Card Drops page</Link> — desktop, with map import and filters.
      </p>
    </div>
  )
}
