import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { createProjectAction } from '@/app/actions/projects'
import { queryFailed } from '@/lib/supabase/errors'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams
  const supabase = await createClient()
  const { data: clients, error } = await supabase.from('clients').select('id, name').neq('status', 'archived').order('name')
  queryFailed('clients', error)

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Projects · New</div>
        <h1 className="page-title">Create Project</h1>
      </div>

      <ProjectForm
        action={createProjectAction}
        clients={clients ?? []}
        defaultClientId={client_id}
        submitLabel="Create project"
      />

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-soft)' }}>
        <Link href="/projects" style={{ borderBottom: '1px solid var(--rule)' }}>← Back to projects</Link>
      </p>
    </div>
  )
}
