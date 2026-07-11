import { IntakeForm } from '@/components/intake/IntakeForm'

/**
 * PUBLIC written intake — no login. The single-use token in the URL is the
 * authorization; validation happens inside the submit RPC, so this page
 * reads nothing and leaks nothing.
 */
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

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
          Ten minutes, in your own words — no wrong answers. This is how I show up to
          our conversation already understanding your business instead of spending the
          first hour asking these questions out loud.
        </p>

        <IntakeForm token={token} />
      </div>
    </div>
  )
}
