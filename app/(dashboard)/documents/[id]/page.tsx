import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { DownloadMarkdownButton, DownloadPdfButton } from '@/components/documents/DownloadButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Document } from '@/lib/types'

const ENTITY_PATHS: Record<string, string> = {
  assessment: '/assessments',
  proposal: '/proposals',
  project: '/projects',
  client: '/clients',
}

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: doc, error } = await supabase.from('documents').select('*').eq('id', id).single()
  if (queryFailed('documents', error)) return <ErrorState title="Couldn't load this document" />
  if (!doc) notFound()

  const d = doc as Document
  const backPath = `${ENTITY_PATHS[d.entity_type] ?? ''}/${d.entity_id}`

  return (
    <div className="doc-viewer">
      <div className="doc-viewer__header">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>
          <Link href={backPath} style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--rule)' }}>
            ← Back to {d.entity_type}
          </Link>
        </div>
        <h1 className="doc-viewer__title">{d.name}</h1>
        <div className="doc-viewer__meta">
          <span className="doc-viewer__meta-item">
            {new Date(d.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="doc-viewer__meta-item">
            {d.is_shared ? '· Shared with client' : '· Internal only'}
          </span>
        </div>
        <div className="doc-viewer__actions">
          <DownloadMarkdownButton documentName={d.name} content={d.content} />
          <DownloadPdfButton />
        </div>
      </div>

      <MarkdownViewer content={d.content} />
    </div>
  )
}
