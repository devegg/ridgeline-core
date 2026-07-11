'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SettingsPanel({ email, projectHost }: { email: string; projectHost: string }) {
  const router = useRouter()
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
    setMsg({ ok: true, text: 'Password updated.' })
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
      <div className="section-card">
        <div className="section-card__head">Account</div>
        <div className="section-card__body">
          <div className="detail-field">
            <div className="detail-field__label">Signed in as</div>
            <div className="detail-field__value">{email}</div>
          </div>

          <form onSubmit={changePassword} style={{ marginTop: 16, padding: '0 16px 16px' }}>
            <div className="field">
              <label htmlFor="s-pw">New password</label>
              <input id="s-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="s-pw2">Repeat new password</label>
              <input id="s-pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            </div>
            {msg && (
              <div className={msg.ok ? 'form__note' : 'field__error'} role="status" style={{ margin: '8px 0' }}>
                {msg.text}
              </div>
            )}
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card__head">System</div>
        <div className="section-card__body">
          <div className="detail-field">
            <div className="detail-field__label">Database</div>
            <div className="detail-field__value">{projectHost || 'not configured'}</div>
          </div>
          <div className="detail-field" style={{ marginTop: 10 }}>
            <div className="detail-field__label">Session</div>
            <div className="detail-field__value">
              <button className="dash-topbar__signout" onClick={signOut}>
                Sign out everywhere on this device
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
