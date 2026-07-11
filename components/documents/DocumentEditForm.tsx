'use client'

import { useActionState } from 'react'
import { updateDocumentAction } from '@/app/actions/documents'
import type { ActionState, Document } from '@/lib/types'

export function DocumentEditForm({ doc }: { doc: Document }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateDocumentAction, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860 }}>
      <input type="hidden" name="id" value={doc.id} />
      {state?.errors?._root && <div className="login-error">{state.errors._root}</div>}
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={doc.name} required />
      </div>
      <div className="field">
        <label>Content (Markdown)</label>
        <textarea
          name="content"
          defaultValue={doc.content}
          style={{ minHeight: 420, fontFamily: 'var(--mono)', fontSize: 13.5, lineHeight: 1.6 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save document'}
        </button>
      </div>
    </form>
  )
}
