import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadDetail } from '@/components/leads/LeadDetail'
import { ErrorState } from '@/components/ui/ErrorState'
import { queryFailed } from '@/lib/supabase/errors'
import type { Lead } from '@/lib/types'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead, error } = await supabase.from('leads').select('*').eq('id', id).single()
  if (queryFailed('leads', error)) return <ErrorState title="Couldn't load this lead" />
  if (!lead) notFound()
  return <LeadDetail lead={lead as Lead} />
}
