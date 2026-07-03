import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProposalForm } from '@/components/forms/ProposalForm'
import { createProposalAction } from '@/app/actions/proposals'
import { queryFailed } from '@/lib/supabase/errors'

export default async function NewProposalPage() {
  const supabase = await createClient()
  const [
    { data: clients, error: clientsError },
    { data: projects, error: projectsError },
  ] = await Promise.all([
    supabase.from('clients').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
  ])
  queryFailed('clients', clientsError)
  queryFailed('projects', projectsError)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Proposals · New</div>
        <h1 className="page-title">Create Proposal</h1>
      </div>

      <ProposalForm action={createProposalAction} clients={clients ?? []} projects={projects ?? []} submitLabel="Save as draft" />

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/proposals" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to proposals</Link>
      </p>
    </div>
  )
}
