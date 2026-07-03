import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { DownloadMarkdownButton, DownloadPdfButton } from '@/components/documents/DownloadButton'
import type { Document } from '@/lib/types'

export default async function PortalDocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('is_shared', true)
    .single()

  if (!doc) notFound()
  const d = doc as Document

  return (
    <div className="doc-viewer">
      <div className="doc-viewer__header">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>
          <Link href="/portal/documents" style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--rule)' }}>
            ← Documents
          </Link>
        </div>
        <h1 className="doc-viewer__title">{d.name}</h1>
        <div className="doc-viewer__meta">
          <span className="doc-viewer__meta-item">
            {new Date(d.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="doc-viewer__meta-item">Ridgeline Knows</span>
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
