import Link from 'next/link'
import { ClientForm } from '@/components/forms/ClientForm'
import { createClientAction } from '@/app/actions/clients'

export default function NewClientPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Clients · New</div>
        <h1 className="page-title">Add Client</h1>
      </div>

      <ClientForm action={createClientAction} submitLabel="Add client" />

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/clients" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to clients</Link>
      </p>
    </div>
  )
}
