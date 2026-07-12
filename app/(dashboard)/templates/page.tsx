import { EmailTemplates } from '@/components/dashboard/TemplatePanels'

export default function TemplatesPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Communications</div>
        <h1 className="page-title">Email templates</h1>
        <p className="page-description">
          The emails that repeat, pre-written. Fill the fields, copy, paste into your mail client.
        </p>
      </div>
      <div style={{ marginTop: 32, maxWidth: 760 }}>
        <EmailTemplates />
      </div>
    </div>
  )
}
