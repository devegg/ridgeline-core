import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import { FilterTabs } from '@/components/ui/FilterTabs'
import type { Document } from '@/lib/types'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Assessments', value: 'assessment' },
  { label: 'Proposals', value: 'proposal' },
  { label: 'Projects', value: 'project' },
  { label: 'Clients', value: 'client' },
]

type Doc = Document & { is_public?: boolean }

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const current = type || 'all'
  const supabase = await createClient()

  let query = supabase.from('documents').select('*').order('updated_at', { ascending: false })
  if (current !== 'all') query = query.eq('entity_type', current)
  const { data: documents, error } = await query
  const loadFailed = queryFailed('documents', error)
  const docs = (documents ?? []) as Doc[]

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Documents</div>
        <h1 className="page-title">All Documents</h1>
        <p className="page-description">
          Every document across assessments, proposals, projects, and clients. Upload and manage
          documents from the record they belong to; view and share from here.
        </p>
      </div>

      <FilterTabs tabs={TABS} current={current} basePath="/documents" param="type" />

      {loadFailed ? (
        <ErrorState />
      ) : docs.length === 0 ? (
        <EmptyState
          title="No documents yet"
          body="Documents are added from an assessment, proposal, project, or client record — open one and use its Documents section."
        />
      ) : (
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Attached to</th>
                <th>Portal</th>
                <th>Public</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/documents/${d.id}`}>{d.name}</Link>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{d.entity_type}</td>
                  <td>{d.is_shared ? 'Shared' : '—'}</td>
                  <td>{d.is_public ? 'Public' : '—'}</td>
                  <td>{new Date(d.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
