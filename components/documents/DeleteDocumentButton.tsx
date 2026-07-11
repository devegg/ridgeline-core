'use client'

import { useState } from 'react'
import { deleteDocumentAction, deleteDocumentAndReturnAction } from '@/app/actions/documents'
import type { DocumentEntityType } from '@/lib/types'

/** Two-step confirm for a destructive action (house rule): first click
    arms, second click deletes; clicking anything else disarms on blur. */
export function DeleteDocumentButton({ documentId, entityType, entityId, compact = false, returnToRecord = false }: {
  documentId: string
  entityType: DocumentEntityType
  entityId: string
  compact?: boolean
  returnToRecord?: boolean
}) {
  const [armed, setArmed] = useState(false)

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={compact ? 'portal-nav__signout' : 'btn-outline'}
        style={compact ? undefined : { fontSize: 12, padding: '6px 14px' }}
      >
        Delete
      </button>
    )
  }

  return (
    <form action={(returnToRecord ? deleteDocumentAndReturnAction : deleteDocumentAction).bind(null, documentId, entityType, entityId)} style={{ display: 'inline' }}>
      <button
        type="submit"
        onBlur={() => setArmed(false)}
        autoFocus
        className={compact ? 'portal-nav__signout' : 'btn-danger'}
        style={compact ? { color: '#B14B3C', borderBottom: '1px solid #B14B3C' } : { fontSize: 12, padding: '6px 14px' }}
      >
        Really delete?
      </button>
    </form>
  )
}
