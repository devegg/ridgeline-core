'use client'

import Link from 'next/link'
import { useActionState, useState, useRef, useEffect } from 'react'
import { uploadDocumentAction, toggleShareAction, deleteDocumentAction } from '@/app/actions/documents'
import type { Document, DocumentEntityType, ActionState } from '@/lib/types'

interface DocumentListProps {
  documents: Document[]
  entityType: DocumentEntityType
  entityId: string
  portalBase?: string // e.g. '/portal/documents' for portal links
}

function UploadForm({ entityType, entityId, onDone }: {
  entityType: DocumentEntityType
  entityId: string
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(uploadDocumentAction, null)
  const [fileName, setFileName] = useState('')
  const [content, setContent] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name.replace(/\.md$/i, ''))
    const reader = new FileReader()
    reader.onload = (ev) => setContent(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  useEffect(() => {
    if (state?.message) onDone()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.message])

  return (
    <form action={formAction} className="inline-form">
      <input type="hidden" name="entity_type" value={entityType} />
      <input type="hidden" name="entity_id" value={entityId} />
      <input type="hidden" name="content" value={content} />

      {state?.errors?._root && <div className="login-error" style={{ marginBottom: 0 }}>{state.errors._root}</div>}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '0 0 auto' }}>
          <label>Markdown file (.md)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.txt"
            onChange={handleFile}
            required
            style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-muted)' }}
          />
        </div>
        <div className={`field ${state?.errors?.name ? 'field--error' : ''}`} style={{ flex: 1, minWidth: 200 }}>
          <label>Document name</label>
          <input
            name="name"
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="Title for this document"
            required
          />
          {state?.errors?.name && <div className="field__error">{state.errors.name}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          name="is_shared"
          type="checkbox"
          id="doc-share"
          value="true"
          style={{ width: 14, height: 14, accentColor: 'var(--blue)' }}
        />
        <label htmlFor="doc-share" style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-muted)', cursor: 'pointer' }}>
          Share with client portal immediately
        </label>
      </div>

      {!content && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>
          Select a file above to enable upload.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary" disabled={pending || !content} style={{ fontSize: 13, padding: '8px 16px' }}>
          {pending ? 'Uploading…' : 'Upload document'}
        </button>
        <button type="button" className="btn-outline" onClick={onDone} style={{ fontSize: 13 }}>Cancel</button>
      </div>
    </form>
  )
}

export function DocumentList({ documents, entityType, entityId, portalBase }: DocumentListProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  return (
    <div className="section-card__body">
      {documents.length === 0 && !showUpload && (
        <div className="section-card__empty">No documents attached yet.</div>
      )}

      {documents.map(doc => (
        <div key={doc.id} style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)' }}>MD</span>
              <span style={{ fontSize: 15, color: 'var(--ink)' }}>{doc.name}</span>
              {doc.is_shared && <span className="badge badge-active" style={{ fontSize: '8.5px' }}>Shared</span>}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>
              {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <Link
              href={`/documents/${doc.id}`}
              className="btn-outline"
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              View
            </Link>
            <form action={toggleShareAction.bind(null, doc.id, entityType, entityId, !doc.is_shared)}>
              <button type="submit" className="btn-outline" style={{ fontSize: 12, padding: '4px 10px' }}>
                {doc.is_shared ? 'Unshare' : 'Share'}
              </button>
            </form>
            {confirmDeleteId === doc.id ? (
              <>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#8B2A1E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delete?</span>
                <form action={deleteDocumentAction.bind(null, doc.id, entityType, entityId)}>
                  <button type="submit" className="btn-danger" style={{ fontSize: 11, padding: '4px 10px' }}>Yes</button>
                </form>
                <button className="btn-outline" onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 11, padding: '4px 10px' }}>No</button>
              </>
            ) : (
              <button className="btn-danger" style={{ fontSize: 12, padding: '4px 10px', opacity: 0.7 }} onClick={() => setConfirmDeleteId(doc.id)}>×</button>
            )}
          </div>
        </div>
      ))}

      {showUpload ? (
        <UploadForm entityType={entityType} entityId={entityId} onDone={() => setShowUpload(false)} />
      ) : (
        <div style={{ padding: '12px 22px' }}>
          <button type="button" className="btn-outline" onClick={() => setShowUpload(true)} style={{ fontSize: 12, padding: '6px 14px' }}>
            + Attach Markdown file
          </button>
        </div>
      )}
    </div>
  )
}
