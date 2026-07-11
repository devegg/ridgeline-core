import type { ChangeRequest } from '@/lib/types'

const STATUS_LABEL: Record<ChangeRequest['status'], string> = {
  new: 'Received',
  in_progress: 'In progress',
  done: 'Done',
}

const URGENCY_LABEL: Record<ChangeRequest['urgency'], string> = {
  low: 'No rush',
  normal: 'Normal',
  high: 'Urgent',
}

export function RequestCard({ request }: { request: ChangeRequest }) {
  const submitted = new Date(request.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="request-card">
      <div className="request-card__head">
        <div className="request-card__title">{request.title}</div>
        <div className="request-card__meta">
          {submitted} · {URGENCY_LABEL[request.urgency]} · {STATUS_LABEL[request.status]}
        </div>
      </div>
      {request.detail && <p className="request-card__detail">{request.detail}</p>}
      {request.response && (
        <div className="request-card__response">
          <div className="request-card__response-label">
            Ridgeline replied{request.responded_on ? ` · ${new Date(request.responded_on + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
          </div>
          {request.response}
        </div>
      )}
    </div>
  )
}
