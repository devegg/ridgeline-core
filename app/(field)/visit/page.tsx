import { createClient } from '@/lib/supabase/server'
import { FieldHome } from '@/components/field/FieldHome'
import type { Prospect } from '@/lib/types'

/**
 * The field home — everything a drop-in needs, on a phone, with no sidebar:
 * snap a card, or pick the business you just walked into and start pricing.
 * The dashboard's /prospects stays as-is for desktop.
 */
export default async function FieldListPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('prospects')
    .select('*')
    .in('status', ['untouched', 'visited', 'interested'])
    .order('business_name')

  const prospects = (data ?? []) as Prospect[]

  return <FieldHome prospects={prospects} />
}
