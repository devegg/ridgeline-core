'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'password' | 'link'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    if (mode === 'link') {
      // Passwordless: email a one-time sign-in link. shouldCreateUser: false —
      // an unknown email must never create an account.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      })
      setLoading(false)
      if (otpError) {
        setError(
          otpError.message.includes('not found') || otpError.message.toLowerCase().includes('signups')
            ? 'That email is not set up for access. Reach out if you need an account.'
            : otpError.message,
        )
        return
      }
      setLinkSent(true)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = data.user?.app_metadata?.role as string | undefined
    router.push(role === 'owner' ? '/overview' : '/portal')
    router.refresh()
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setLinkSent(false)
  }

  return (
    <div className="login-page site-bg">
      <div className="site-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--gutter)' }}>
        <div className="login-card">
          <Link href="/" className="wordmark" style={{ marginBottom: '48px', display: 'inline-flex' }}>
            <span>Ridgeline</span>
            <span className="wordmark__rule" />
            <em>Knows</em>
          </Link>

          <h1 className="login-card__title">
            Sign in to your<br /><em>workspace.</em>
          </h1>
          <p className="login-card__sub">
            Active clients and internal team only. If you need access, reach out directly.
          </p>

          {linkSent ? (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink)' }}>
                Check your email — I sent a sign-in link to <strong>{email}</strong>.
                It signs you straight in, no password needed.
              </p>
              <button
                type="button"
                onClick={() => setLinkSent(false)}
                style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', cursor: 'pointer', borderBottom: '1px solid var(--amber)', paddingBottom: 2 }}
              >
                Send it again
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={onSubmit} noValidate>
              {error && <div className="login-error">{error}</div>}

              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {mode === 'password' && (
                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? (mode === 'link' ? 'Sending…' : 'Signing in…')
                    : (mode === 'link' ? 'Email me a sign-in link' : 'Sign in')}
                  {!loading && <span className="arrow" />}
                </button>
              </div>

              <p style={{ marginTop: 16, fontSize: 13.5, color: 'var(--ink-muted)' }}>
                {mode === 'password' ? (
                  <button type="button" onClick={() => switchMode('link')} style={{ cursor: 'pointer', borderBottom: '1px solid var(--amber)', paddingBottom: 1, color: 'inherit' }}>
                    No password? Get a sign-in link by email instead
                  </button>
                ) : (
                  <button type="button" onClick={() => switchMode('password')} style={{ cursor: 'pointer', borderBottom: '1px solid var(--amber)', paddingBottom: 1, color: 'inherit' }}>
                    Sign in with a password instead
                  </button>
                )}
              </p>
            </form>
          )}

          <p style={{ marginTop: '32px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            <Link href="/" style={{ borderBottom: '1px solid var(--amber)', paddingBottom: '2px' }}>
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
