'use client'

import { useActionState, useRef, useState } from 'react'
import { saveCardAction } from '@/app/actions/prospects'
import { parseCardText, type CardGuess } from '@/lib/card-parse'
import type { ActionState } from '@/lib/types'

/** Snap → OCR (in the browser, free) → confirm the guesses → save.
    The photo rides along and attaches to the prospect; OCR guesses are
    never saved without human eyes on them. */
export function CardScan({ prospects }: { prospects: { id: string; business_name: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCardAction, null)
  const [phase, setPhase] = useState<'idle' | 'reading' | 'confirm'>('idle')
  const [progress, setProgress] = useState(0)
  const [guess, setGuess] = useState<CardGuess | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhase('reading')
    setProgress(0)
    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        },
      })
      setGuess(parseCardText(result.data.text ?? ''))
    } catch {
      // OCR failed (odd image, worker blocked): fall through with empty
      // guesses — the photo still attaches and the fields are typed by hand.
      setGuess(parseCardText(''))
    }
    setPhase('confirm')
  }

  if (phase === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink-muted)', margin: 0, maxWidth: '60ch', lineHeight: 1.6 }}>
          Snap the card (or pick a photo). It&rsquo;s read on your device — nothing leaves your
          browser until you&rsquo;ve checked the fields — then the photo and details save to a
          prospect.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          style={{ fontSize: 13.5 }}
        />
      </div>
    )
  }

  if (phase === 'reading') {
    return (
      <div style={{ fontSize: 14, color: 'var(--ink-muted)', padding: '10px 0' }}>
        Reading the card&hellip; {progress}%
      </div>
    )
  }

  return (
    <form
      action={(fd) => {
        if (photo) fd.set('photo', photo)
        formAction(fd)
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      {state?.message && (
        <div style={{ padding: '10px 14px', border: '1px solid var(--rule)', background: 'var(--paper)', fontSize: 13.5 }}>
          {state.message}{' '}
          <button
            type="button"
            onClick={() => { setPhase('idle'); setGuess(null); setPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
            style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--blue)' }}
          >
            Scan another
          </button>
        </div>
      )}

      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={URL.createObjectURL(photo)} alt="Business card" style={{ maxWidth: 280, border: '1px solid var(--rule)' }} />
      )}

      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: 0 }}>
        These are OCR guesses — fix anything before saving.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label>Business</label>
          <input name="business_name" defaultValue={guess?.business_name ?? ''} required />
        </div>
        <div className="field" style={{ flex: '1 1 180px' }}>
          <label>Person</label>
          <input name="contact_name" defaultValue={guess?.contact_name ?? ''} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: '1 1 180px' }}>
          <label>Email</label>
          <input name="email" type="email" defaultValue={guess?.email ?? ''} />
        </div>
        <div className="field" style={{ flex: '1 1 150px' }}>
          <label>Phone</label>
          <input name="phone" defaultValue={guess?.phone ?? ''} />
        </div>
        <div className="field" style={{ flex: '1 1 180px' }}>
          <label>Website</label>
          <input name="website" defaultValue={guess?.website ?? ''} />
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <input name="notes" placeholder="Where you met, what they said" />
      </div>
      <div className="field" style={{ maxWidth: 340 }}>
        <label>Attach to an existing prospect (or leave as new)</label>
        <select name="attach_to" defaultValue="">
          <option value="">— create a new prospect —</option>
          {prospects.map(p => <option key={p.id} value={p.id}>{p.business_name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save card'}</button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => { setPhase('idle'); setGuess(null); setPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
          style={{ fontSize: 13, padding: '8px 16px' }}
        >
          Start over
        </button>
      </div>
    </form>
  )
}
