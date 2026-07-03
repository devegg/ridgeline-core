import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Assessment } from '@/lib/types'

export default async function PortalAssessmentsPage() {
  const supabase = await createClient()

  const { data: assessments, error } = await supabase
    .from('assessments')
    .select('*')
    .order('scheduled_date', { ascending: false })
  const loadFailed = queryFailed('assessments', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Assessments</div>
        <h1 className="page-title">Assessments</h1>
        <p className="page-description">Scheduled and completed assessments for your engagement.</p>
      </div>

      {loadFailed ? (
        <ErrorState title="Couldn't load your assessments" body="Refresh to try again. If it keeps happening, reach out." />
      ) : !assessments?.length ? (
        <EmptyState
          title="No assessments yet"
          body="Assessments will appear here once they have been scheduled."
        />
      ) : (
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(assessments as Assessment[]).map(a => (
            <div key={a.id} className="section-card">
              <div className="section-card__head">
                <span style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>{a.title}</span>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {a.scheduled_date && (
                  <div>
                    <div className="detail-field__label">Scheduled</div>
                    <div className="detail-field__value">
                      {new Date(a.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {a.status === 'completed' && a.findings && (
                  <div>
                    <div className="detail-field__label">Findings</div>
                    <div style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.65, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                      {a.findings}
                    </div>
                  </div>
                )}
                {a.status === 'completed' && a.recommendations && (
                  <div>
                    <div className="detail-field__label">Recommendations</div>
                    <div style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.65, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                      {a.recommendations}
                    </div>
                  </div>
                )}
                {a.status !== 'completed' && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Findings will appear here once the assessment is complete.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
