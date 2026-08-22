'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * A client sets or changes their own portal password.
 *
 * Same shape as the owner's `SettingsPanel` on purpose — `auth.updateUser`
 * acts on whoever is signed in, so this can only ever touch the account making
 * the request. There is no client_id to get wrong and no admin key anywhere in
 * the path, which keeps the deny-by-default posture (D8) intact.
 */
export function PasswordForm({ disabled = false }: { disabled?: boolean }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    if (pw.length < 8) return setMsg({ ok: false, text: 'At least 8 characters.' })
    if (pw !== pw2) return setMsg({ ok: false, text: 'Passwords do not match.' })
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) return setMsg({ ok: false, text: error.message })
    setPw('')
    setPw2('')
    setMsg({ ok: true, text: 'Password updated. The email sign-in link keeps working too.' })
  }

  return (
    <form onSubmit={changePassword} style={{ marginTop: 18, maxWidth: 400 }}>
      <div className="field">
        <label htmlFor="portal-new-password">New password</label>
        <input
          id="portal-new-password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          disabled={disabled}
        />
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="portal-repeat-password">Repeat new password</label>
        <input
          id="portal-repeat-password"
          type="password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          autoComplete="new-password"
          disabled={disabled}
        />
      </div>

      {msg && (
        <div
          style={{ marginTop: 12, fontSize: 13, color: msg.ok ? 'var(--ink-muted)' : '#8B2A1E' }}
        >
          {msg.text}
        </div>
      )}

      <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={busy || disabled}>
        {busy ? 'Saving…' : 'Update password'}
      </button>
    </form>
  )
}
