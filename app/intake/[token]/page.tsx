import { IntakeForm, type IntakeContext } from '@/components/intake/IntakeForm'
import { createClient } from '@/lib/supabase/server'

/**
 * PUBLIC written intake — no login. The single-use token in the URL is the
 * authorization. The bounded intake_context RPC personalizes the page for a
 * known client (their name is pre-filled, never re-typed); everything else
 * stays zero-read.
 */
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let context: IntakeContext | null = null
  if (/^[0-9a-f-]{36}$/i.test(token)) {
    const supabase = await createClient() // anon when logged out
    const { data } = await supabase.rpc('intake_context', { p_token: token })
    context = (data as IntakeContext[] | null)?.[0] ?? null
  }

  return (
    <div className="site-bg" style={{ minHeight: '100vh', padding: 'var(--gutter)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 48, paddingBottom: 80 }}>
        <div className="wordmark" style={{ marginBottom: 40 }}>
          <span>Ridgeline</span>
          <span className="wordmark__rule" />
          <em>Knows</em>
        </div>

        <div className="page-eyebrow">Written intake</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, margin: '8px 0 14px' }}>
          Tell me how the work<br /><em style={{ color: 'var(--blue)' }}>actually happens.</em>
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--ink-muted)', maxWidth: '60ch', marginBottom: 36 }}>
          {context?.business_name
            ? `For ${context.business_name} — ten minutes, in your own words, no wrong answers. `
            : 'Ten minutes, in your own words — no wrong answers. '}
          This is how I show up to our conversation already understanding your
          business instead of spending the first hour asking these questions out loud.
        </p>

        <IntakeForm token={token} context={context} />
      </div>
    </div>
  )
}
