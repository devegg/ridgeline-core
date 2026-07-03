interface ErrorStateProps {
  title?: string
  body?: string
}

export function ErrorState({
  title = 'Something went wrong',
  body = 'The data didn’t load. Refresh to try again.',
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__title">{title}</div>
      <p className="error-state__body">{body}</p>
    </div>
  )
}
