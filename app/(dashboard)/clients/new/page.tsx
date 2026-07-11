import Link from 'next/link'
import { ClientForm } from '@/components/forms/ClientForm'
import { createClient } from '@/lib/supabase/server'
import { createClientAction } from '@/app/actions/clients'

export default async function NewClientPage() {
  const supabase = await createClient()
  const { data: industries } = await supabase.from('industries').select('name').order('name')

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Clients · New</div>
        <h1 className="page-title">Add Client</h1>
      </div>

      <ClientForm action={createClientAction} submitLabel="Add client" industries={(industries ?? []).map(i => i.name)} />

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/clients" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to clients</Link>
      </p>
    </div>
  )
}
