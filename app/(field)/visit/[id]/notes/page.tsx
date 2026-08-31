import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitNotes } from '@/components/field/VisitNotes'
import { TRADE_CARDS } from '@/lib/field/cards'
import type { Prospect, VisitNote } from '@/lib/types'

/** Today as 'YYYY-MM-DD' from local parts — see the action for why not UTC. */
function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function VisitNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prospect, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !prospect) notFound()

  // Load today's note if there is one, so a note started in the lobby and
  // finished in the truck reopens with what was already written rather than
  // an empty form.
  let note: VisitNote | null = null
  const { data: visit } = await supabase
    .from('prospect_visits')
    .select('id')
    .eq('prospect_id', id)
    .eq('visited_on', today())
    .order('created_at', { ascending: false })
    .limit(1)

  const visitId = (visit ?? [])[0]?.id as string | undefined
  if (visitId) {
    const { data } = await supabase.from('visit_notes').select('*').eq('visit_id', visitId).maybeSingle()
    note = (data as VisitNote | null) ?? null
  }

  return <VisitNotes prospect={prospect as Prospect} note={note} cardSlugs={TRADE_CARDS} />
}
