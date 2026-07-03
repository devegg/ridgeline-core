import { StubPage } from '@/components/ui/StubPage'

export default function CommunicationsPage() {
  return (
    <StubPage
      eyebrow="Communications"
      title="Communications"
      description="Client communication history, messages, notes, and follow-ups. Planned for a future phase."
      features={[
        'View all client communication',
        'Send direct messages to clients',
        'Archive and flag important conversations',
      ]}
    />
  )
}
