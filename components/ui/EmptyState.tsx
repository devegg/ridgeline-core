import Link from 'next/link'

interface EmptyStateProps {
  title: string
  body: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__title">{title}</div>
      <p className="empty-state__body">{body}</p>
      {actionLabel && actionHref && (
        <div className="empty-state__action">
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
            <span className="arrow" />
          </Link>
        </div>
      )}
    </div>
  )
}
