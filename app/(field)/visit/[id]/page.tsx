import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitEstimator } from '@/components/field/VisitEstimator'
import type { Prospect, ProspectVisit, VisitTask } from '@/lib/types'

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [prospectRes, visitsRes] = await Promise.all([
    supabase.from('prospects').select('*').eq('id', id).single(),
    supabase
      .from('prospect_visits')
      .select('*')
      .eq('prospect_id', id)
      .order('visited_on', { ascending: false })
      .limit(1),
  ])

  if (prospectRes.error || !prospectRes.data) notFound()
  const prospect = prospectRes.data as Prospect
  const lastVisit = (visitsRes.data ?? [])[0] as ProspectVisit | undefined

  // What was priced here last time. `visit_tasks` had a writer and no reader
  // until now, so the numbers said out loud in someone's lobby were gone the
  // moment you walked out — including on the second visit to the same desk.
  //
  // Deliberately NOT "the last visit's tasks": a plain touchpoint logged from
  // the dashboard creates a visit with no tasks, and reading only the newest
  // one would make a real estimate vanish behind a two-second door knock.
  // Find the most recent visit that actually priced something.
  let lastTasks: VisitTask[] = []
  let pricedOn: string | null = null

  const { data: newest } = await supabase
    .from('visit_tasks')
    .select('visit_id')
    .eq('prospect_id', id)
    .order('created_at', { ascending: false })
    .limit(1)

  const pricedVisitId = (newest ?? [])[0]?.visit_id as string | undefined
  if (pricedVisitId) {
    const [tasksRes, visitRes] = await Promise.all([
      supabase.from('visit_tasks').select('*').eq('visit_id', pricedVisitId).order('sort_order'),
      supabase.from('prospect_visits').select('visited_on').eq('id', pricedVisitId).single(),
    ])
    lastTasks = (tasksRes.data ?? []) as VisitTask[]
    pricedOn = (visitRes.data?.visited_on as string | undefined) ?? null
  }

  // Card photos live in a private bucket — a short-lived signed URL, and
  // only when there is one.
  let photoUrl: string | null = null
  if (prospect.card_photo_path) {
    const { data } = await supabase.storage
      .from('cards')
      .createSignedUrl(prospect.card_photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <VisitEstimator
      prospect={prospect}
      lastCardWord={lastVisit?.card_word ?? null}
      lastVisitOn={pricedOn}
      lastTasks={lastTasks}
      photoUrl={photoUrl}
    />
  )
}
