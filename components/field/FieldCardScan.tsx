'use client'

import { useActionState, useRef, useState } from 'react'
import { saveCardAction } from '@/app/actions/prospects'
import { parseCardText, type CardGuess } from '@/lib/card-parse'
import { downscaleImage } from '@/lib/field/downscale'
import { CardCamera } from '@/components/field/CardCamera'
import { noAutofill } from '@/lib/field/no-autofill'
import type { ActionState } from '@/lib/types'

/**
 * Card capture for the phone. Same engine as the dashboard's CardScan —
 * tesseract.js in the browser, `parseCardText` guesses, `saveCardAction`
 * saves — but the trigger is a real button instead of a bare file input,
 * because a raw <input type="file"> renders as a tiny "Choose File" control
 * that is easy to miss standing in someone's lobby.
 *
 * Two triggers on purpose: the camera for a card in your hand, and the
 * library for one you already photographed.
 */
type Attachable = { id: string; business_name: string; status: string }

/** Businesses already promoted or archived are still valid attach targets —
    a second card from the same place should land on the record that exists,
    not create a duplicate the dedupe index will reject anyway. They sit in
    their own group so the working set stays the obvious choice. */
const WORKING = ['untouched', 'visited', 'interested']

export function FieldCardScan({ prospects }: { prospects: Attachable[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCardAction, null)
  const [phase, setPhase] = useState<'idle' | 'camera' | 'reading' | 'confirm'>('idle')
  const [progress, setProgress] = useState(0)
  const [guess, setGuess] = useState<CardGuess | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPhase('idle')
    setGuess(null)
    setPhoto(null)
    if (cameraRef.current) cameraRef.current.value = ''
    if (libraryRef.current) libraryRef.current.value = ''
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    await read(picked)
  }

  async function read(picked: File) {
    setPhase('reading')
    setProgress(0)
    // Shrink first: a raw camera photo is megabytes and blew the Server
    // Action body limit on save. OCR is faster on the smaller image too.
    // A frame from CardCamera is already cropped and sized, so this is a
    // no-op for that path.
    const file = await downscaleImage(picked)
    setPhoto(file)
    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        },
      })
      setGuess(parseCardText(result.data.text ?? ''))
    } catch {
      // OCR failed (odd image, worker blocked): the photo still attaches and
      // the fields get typed by hand.
      setGuess(parseCardText(''))
    }
    setPhase('confirm')
  }

  if (phase === 'camera') {
    return (
      <CardCamera
        onCapture={f => { void read(f) }}
        onCancel={() => setPhase('idle')}
        onFallback={() => { setPhase('idle'); cameraRef.current?.click() }}
      />
    )
  }

  if (phase === 'reading') {
    return <div className="field-scan__reading">Reading the card… {progress}%</div>
  }

  if (phase === 'idle') {
    return (
      <div className="field-scan">
        <button type="button" className="field-camera" onClick={() => setPhase('camera')}>
          <span className="field-camera__icon" aria-hidden="true">📷</span>
          Take a photo of a card
        </button>
        <button type="button" className="field-linkbtn" onClick={() => libraryRef.current?.click()}>
          or pick one from your photos
        </button>
        <p className="field-scan__note">
          Read on your phone — nothing leaves the browser until you&rsquo;ve checked the fields.
        </p>
        {state?.message && <p className="field-ok">{state.message}</p>}

        <input
          ref={cameraRef} type="file" accept="image/*" capture="environment"
          onChange={onPick} hidden
        />
        <input
          ref={libraryRef} type="file" accept="image/*"
          onChange={onPick} hidden
        />
      </div>
    )
  }

  return (
    <form
      className="field-scan"
      action={(fd) => {
        if (photo) fd.set('photo', photo)
        formAction(fd)
      }}
    >
      {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}
      {state?.message && (
        <p className="field-ok">
          {state.message}{' '}
          <button type="button" className="field-linkbtn" onClick={reset}>Scan another</button>
        </p>
      )}

      <input type="hidden" name="go_to_visit" value="1" />

      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={URL.createObjectURL(photo)} alt="Business card" className="field-cardimg" />
      )}

      <p className="field-scan__note">These are guesses — fix anything before saving.</p>

      <label className="field-label">
        Business
        <input name="business_name" className="field-input" {...noAutofill} defaultValue={guess?.business_name ?? ''} required />
      </label>
      <label className="field-label">
        Person
        <input name="contact_name" className="field-input" {...noAutofill} defaultValue={guess?.contact_name ?? ''} />
      </label>
      <label className="field-label">
        Phone
        <input name="phone" className="field-input" {...noAutofill} defaultValue={guess?.phone ?? ''} />
      </label>
      <label className="field-label">
        Email
        <input name="email" type="email" className="field-input" {...noAutofill} defaultValue={guess?.email ?? ''} />
      </label>
      <label className="field-label">
        Notes
        <input name="notes" className="field-input" {...noAutofill} placeholder="Who you met, what they said" />
      </label>
      <label className="field-label field-label--muted">
        Attach to a business already on the list?
        <select name="attach_to" className="field-input" defaultValue="">
          <option value="">— create a new one —</option>
          {prospects.filter(p => WORKING.includes(p.status)).map(p => (
            <option key={p.id} value={p.id}>{p.business_name}</option>
          ))}
          {prospects.some(p => !WORKING.includes(p.status)) && (
            <optgroup label="Already promoted or archived">
              {prospects.filter(p => !WORKING.includes(p.status)).map(p => (
                <option key={p.id} value={p.id}>
                  {p.business_name} ({p.status === 'lead' ? 'lead' : p.status})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>

      <button type="submit" className="field-submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save and start the visit'}
      </button>
      <button type="button" className="field-linkbtn" onClick={reset}>Start over</button>
    </form>
  )
}
