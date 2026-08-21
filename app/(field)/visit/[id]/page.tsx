import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitEstimator } from '@/components/field/VisitEstimator'
import type { Prospect, ProspectVisit } from '@/lib/types'

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
      photoUrl={photoUrl}
    />
  )
}
