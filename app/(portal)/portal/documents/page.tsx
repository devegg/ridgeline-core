import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Document } from '@/lib/types'

export default async function PortalDocumentsPage() {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('is_shared', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Documents</div>
        <h1 className="page-title">Shared Documents</h1>
        <p className="page-description">Documents and files shared with you by Ridgeline Knows.</p>
      </div>

      {!documents?.length ? (
        <EmptyState
          title="No documents yet"
          body="Documents shared with you will appear here once they have been released."
        />
      ) : (
        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(documents as Document[]).map(doc => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {doc.entity_type}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/portal/documents/${doc.id}`} className="btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
