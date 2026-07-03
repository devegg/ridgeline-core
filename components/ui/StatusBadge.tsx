interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replace('_', ' ')
  return <span className={`badge badge-${status}`}>{label}</span>
}
