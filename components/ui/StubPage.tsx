interface Action {
  label: string
  primary?: boolean
}

interface StubPageProps {
  eyebrow: string
  title: string
  description: string
  actions?: Action[]
  features?: string[]
}

export function StubPage({ eyebrow, title, description, actions = [], features = [] }: StubPageProps) {
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>

      {actions.length > 0 && (
        <div className="page-actions">
          {actions.map((a) =>
            a.primary ? (
              <button key={a.label} className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                {a.label}
              </button>
            ) : (
              <button key={a.label} className="btn-outline" disabled style={{ cursor: 'not-allowed' }}>
                {a.label}
              </button>
            )
          )}
        </div>
      )}

      <div className="stub-notice" style={{ marginTop: actions.length ? '32px' : '40px' }}>
        <div className="stub-notice__label">Phase 1b · Not yet built</div>
        <div className="stub-notice__body">
          This page is scaffolded and routed. Data models, queries, and UI will be implemented in Phase 1b.
          {features.length > 0 && (
            <ul style={{ marginTop: '12px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
