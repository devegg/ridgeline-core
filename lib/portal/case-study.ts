import type { SupabaseClient } from '@supabase/supabase-js'
import { HAIRCUT, formatDollars, formatHours, type ValueRawRow } from '@/lib/portal/value'
import type { Automation, PortalHighlight } from '@/lib/types'

/**
 * Case-study draft — the one-data-model's third view. Anonymization rules
 * from the proof research: a descriptor label (industry + region), never an
 * invented company name; rounded, conservative figures only; a vaguer true
 * statement always beats a precise fabricated one. The output is a DRAFT
 * for owner editing, saved unshared.
 */
export async function composeCaseStudyDraft(
  supabase: SupabaseClient,
  clientId: string,
): Promise<{ name: string; content: string } | { error: string }> {
  const monthStart = new Date().toISOString().slice(0, 8) + '01'
  const [clientRes, automationsRes, highlightsRes, rawRes, issuesRes] = await Promise.all([
    supabase.from('clients').select('id, name, industry, location, blended_labor_rate').eq('id', clientId).single(),
    supabase.from('automations').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.from('portal_highlights').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.rpc('portal_value_raw', { p_client: clientId, p_month_start: monthStart }),
    supabase.from('caught_issues').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
  ])

  if (clientRes.error || !clientRes.data) return { error: 'Client not found.' }
  const automations = (automationsRes.data ?? []) as Automation[]
  if (automations.length === 0) return { error: 'No automations — nothing to write up yet.' }

  const raw = ((rawRes.data ?? []) as ValueRawRow[])[0]
  const launchHours = raw ? (Number(raw.launch_raw_minutes) * (1 - HAIRCUT)) / 60 : 0
  const launchDollars = launchHours * Number(clientRes.data.blended_labor_rate)
  const issuesTotal = issuesRes.count ?? 0

  const earliest = automations.map(a => a.started_on).sort()[0]
  const months = Math.max(1, Math.round(
    (Date.now() - new Date(`${earliest}T12:00:00`).getTime()) / (30.44 * 24 * 3600 * 1000),
  ))

  const industry = (clientRes.data.industry as string | null)?.toLowerCase() || 'small'
  const descriptor = `A ${industry} business on the South Carolina coast`
  const highlights = (highlightsRes.data ?? []) as PortalHighlight[]

  const content = `# ${descriptor}: ${formatHours(launchHours, true)} hours back in ${months} month${months === 1 ? '' : 's'}

> DRAFT — anonymized case study generated ${new Date().toISOString().slice(0, 10)} from live
> portal data. Review every line before sharing; publish only figures the client
> would confirm. [TBD: client approval]

## The situation

${descriptor}. [TBD: one paragraph on how the work actually happened before —
pull the candid "before" from the audit intake and your notes.]

## What we built

${automations.map(a => `- **${a.name}** — ${a.plain_summary ?? '[TBD: one plain sentence]'}`).join('\n')}

## The results, counted conservatively

- About **${formatHours(launchHours, true)} hours** of manual work eliminated over ${months} month${months === 1 ? '' : 's'}
- Roughly **${formatDollars(launchDollars, true)}** in staff time, at the client's own blended labor cost
- **${issuesTotal}** problems caught and fixed before they reached the owner or a customer
${highlights.slice(0, 2).map(h => `- ${h.line}`).join('\n')}

## How these numbers are counted

Time per task was measured before each automation went live, only work someone
actually did is counted, and the totals are cut by ${Math.round(HAIRCUT * 100)}% to stay
on the safe side. Dollar figures use the client's own blended labor cost, not
a made-up rate.
`

  return { name: `Case study draft — ${descriptor}`, content }
}
