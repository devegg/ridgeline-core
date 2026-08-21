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

  // Two different questions, so two different reads. The visible list is the
  // working set. The card scanner's "attach to" needs EVERY business on file,
  // including ones already promoted to a Lead — otherwise re-scanning a
  // promoted business's card hits the dedupe index and the only fix offered
  // is a dropdown it was filtered out of.
  const [workingRes, allRes] = await Promise.all([
    supabase
      .from('prospects')
      .select('*')
      .in('status', ['untouched', 'visited', 'interested'])
      .order('business_name'),
    supabase
      .from('prospects')
      .select('id, business_name, status')
      .order('business_name'),
  ])

  const prospects = (workingRes.data ?? []) as Prospect[]
  const attachable = (allRes.data ?? []) as Pick<Prospect, 'id' | 'business_name' | 'status'>[]

  return <FieldHome prospects={prospects} attachable={attachable} />
}
