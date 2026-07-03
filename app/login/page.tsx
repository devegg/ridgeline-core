'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = (data.user?.app_metadata?.role as string) ?? 'owner'
    router.push(role === 'client' ? '/portal' : '/overview')
    router.refresh()
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

            <div style={{ marginTop: '8px' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <span className="arrow" />}
              </button>
            </div>
          </form>

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
