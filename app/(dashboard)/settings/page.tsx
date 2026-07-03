import { StubPage } from '@/components/ui/StubPage'

export default function SettingsPage() {
  return (
    <StubPage
      eyebrow="Settings"
      title="Settings"
      description="Platform permissions, billing configuration, team management, and audit logs. Planned for a future phase."
      features={[
        'Invite and remove Admin users',
        'Set platform permissions and access levels',
        'Configure billing and invoice settings',
        'View audit logs',
      ]}
    />
  )
}
