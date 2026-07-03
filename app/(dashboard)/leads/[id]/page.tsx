import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadDetail } from '@/components/leads/LeadDetail'
import type { Lead } from '@/lib/types'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single()
  if (!lead) notFound()
  return <LeadDetail lead={lead as Lead} />
}
