'use client'

import { useActionState } from 'react'
import { runScaffolderAction } from '@/app/actions/scaffolder'

type ScaffolderResult = { ok: boolean; output: string; projectName?: string } | null

export default function ScaffolderPage() {
  const [result, formAction, pending] = useActionState<ScaffolderResult, FormData>(runScaffolderAction, null)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Tools · Scaffolder</div>
        <h1 className="page-title">Project Scaffolder</h1>
        <p className="page-description">
          Creates the standard Ridgeline folder structure for a new client project. The project is created in the parent directory of this repo.
        </p>
      </div>

      <form action={formAction} className="form" style={{ maxWidth: 480, marginTop: 32 }}>
        <div className="field">
          <label htmlFor="sc-name">Project name</label>
          <input
            id="sc-name"
            name="project_name"
            type="text"
            placeholder="my-client-project"
            pattern="[a-zA-Z0-9 _-]+"
            required
            style={{ textTransform: 'lowercase' }}
          />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', marginTop: 6, letterSpacing: '0.1em' }}>
            Lowercase letters, numbers, and hyphens only. Spaces become hyphens.
          </div>
        </div>

        <div className="form__footer">
          <div className="form__note">
            Creates folder structure in <code style={{ fontSize: 11 }}>/[parent]/{'{'}project-name{'}'}/</code>
          </div>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Scaffolding…' : 'Run scaffolder'}
            {!pending && <span className="arrow" />}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10, color: result.ok ? 'var(--ink)' : '#B14B3C' }}>
            {result.ok ? `✓ Scaffolded: ${result.projectName}` : '✕ Error'}
          </div>
          <div className="log-viewer">
            {result.output || '(no output)'}
          </div>
        </div>
      )}

      {/* Script reference */}
      <div className="section-card" style={{ marginTop: 40 }}>
        <div className="section-card__head">
          <span className="section-card__label">Script reference</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.12em' }}>
            scripts/scaffold-project.sh
          </span>
        </div>
        <div style={{ padding: '16px 22px' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Creates <code>/app</code>, <code>/docs</code> (with architecture, setup, deployment, features, client, api, decisions, gitignored, extras), <code>/config</code>, and <code>/scripts</code>. Initializes a <code>.gitignore</code>, <code>.env.example</code>, and root <code>README.md</code>.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginTop: 10 }}>
            The script prompts to initialize a git repository when run directly from the CLI. When run from this panel, git init is skipped (non-interactive mode).
          </p>
        </div>
      </div>
    </div>
  )
}
