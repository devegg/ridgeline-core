'use client'

import Link from 'next/link'

/**
 * Field screens fail in front of a prospective client, standing in their
 * lobby. Next's default is a bare "Application error: a client-side
 * exception has occurred", which tells Brian nothing and looks broken to
 * whoever is reading over his shoulder.
 *
 * This says what to do and gets him back to work in one tap.
 */
export default function FieldError({
  error, reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="field-screen">
      <header className="field-head">
        <div className="field-eyebrow">Field kit</div>
        <h1 className="field-title">That didn&rsquo;t save</h1>
        <p className="field-sub">
          Nothing was lost on your phone — try again. If it keeps failing, the
          photo may be too large or the signal too weak.
        </p>
      </header>

      <button type="button" className="field-submit" onClick={reset}>
        Try again
      </button>

      <p className="field-foot">
        <Link href="/visit">Back to Card drops</Link>
        {error.digest && <> · reference {error.digest}</>}
      </p>
    </div>
  )
}
