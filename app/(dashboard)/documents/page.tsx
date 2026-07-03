import { StubPage } from '@/components/ui/StubPage'

export default function DocumentsPage() {
  return (
    <StubPage
      eyebrow="Documents"
      title="Documents"
      description="All documents across assessments, proposals, deliverables, and supporting files. Planned for a future phase."
      features={[
        'View all documents by project / client',
        'Upload and organize documents',
        'Version control',
        'Download and archive',
      ]}
    />
  )
}
