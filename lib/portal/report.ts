import type { SupabaseClient } from '@supabase/supabase-js'
import type { Automation, CaughtIssue, RoadmapItem } from '@/lib/types'
import { HAIRCUT, formatDollars, formatHours, hoursSaved, type ValueRawRow } from '@/lib/portal/value'

/**
 * Monthly report composition — the same honest numbers as the dashboard
 * (one data model, three views: dashboard, this report, case studies).
 * Layout B from the dashboard research: a plain-English paragraph first,
 * then the cards, the caught & fixed list, and what's next.
 */

export interface ReportData {
  clientName: string
  monthLabel: string // "July 2026"
  monthHours: number
  monthDollars: number
  monthItems: number
  launchHours: number
  launchDollars: number
  issuesMonth: CaughtIssue[]
  issuesTotal: number
  roadmap: RoadmapItem[]
  laborRate: number
  allRunning: boolean
}

/** First day of the month AFTER the given YYYY-MM (exclusive upper bound). */
function nextMonthStart(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

export async function gatherReportData(
  supabase: SupabaseClient,
  clientId: string,
  month: string, // YYYY-MM
): Promise<ReportData | { error: string }> {
  const monthStart = `${month}-01`
  const monthEnd = nextMonthStart(month) // exclusive

  const [clientRes, automationsRes, activityRes, issuesRes, roadmapRes, rawRes] = await Promise.all([
    supabase.from('clients').select('id, name, blended_labor_rate').eq('id', clientId).single(),
    supabase.from('automations').select('*').eq('client_id', clientId),
    supabase.from('automation_activity')
      .select('automation_id, activity_on, items_processed, automations!inner(client_id)')
      .eq('automations.client_id', clientId)
      .gte('activity_on', monthStart).lt('activity_on', monthEnd),
    supabase.from('caught_issues').select('*').eq('client_id', clientId)
      .gte('occurred_on', monthStart).lt('occurred_on', monthEnd)
      .order('occurred_on', { ascending: false }),
    supabase.from('roadmap_items').select('*').eq('client_id', clientId).order('sort_order'),
    supabase.rpc('portal_value_raw', { p_client: clientId, p_month_start: monthStart }),
  ])

  if (clientRes.error || !clientRes.data) return { error: 'Client not found.' }
  const automations = (automationsRes.data ?? []) as Automation[]
  if (automations.length === 0) return { error: 'No automations yet — nothing to report.' }

  const { count: issuesTotal } = await supabase
    .from('caught_issues').select('id', { count: 'exact', head: true }).eq('client_id', clientId)

  const baseline = new Map(automations.map(a => [a.id, Number(a.baseline_minutes_per_item)]))
  let monthHours = 0, monthItems = 0
  type ActivityRow = { automation_id: string; items_processed: number }
  for (const row of (activityRes.data ?? []) as ActivityRow[]) {
    const minutes = baseline.get(row.automation_id)
    if (!minutes) continue
    monthHours += hoursSaved(row.items_processed, minutes)
    monthItems += row.items_processed
  }

  const laborRate = Number(clientRes.data.blended_labor_rate)
  const raw = ((rawRes.data ?? []) as ValueRawRow[])[0]
  const launchHours = raw ? (Number(raw.launch_raw_minutes) * (1 - HAIRCUT)) / 60 : 0

  return {
    clientName: clientRes.data.name,
    monthLabel: new Date(`${monthStart}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    monthHours,
    monthDollars: monthHours * laborRate,
    monthItems,
    launchHours,
    launchDollars: launchHours * laborRate,
    issuesMonth: (issuesRes.data ?? []) as CaughtIssue[],
    issuesTotal: issuesTotal ?? 0,
    roadmap: (roadmapRes.data ?? []) as RoadmapItem[],
    laborRate,
    allRunning: automations.every(a => a.status !== 'issue'),
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/** Plain, email-safe HTML. Warm-paper brand, inline styles only. */
export function renderReportHtml(d: ReportData, portalUrl: string): { subject: string; html: string } {
  const hours = formatHours(d.monthHours)
  const dollars = formatDollars(d.monthDollars)
  const subject = `${d.monthLabel} — what your automations saved you`

  const narrative =
    `In ${esc(d.monthLabel)}, your automations handled ${d.monthItems.toLocaleString()} items, ` +
    `caught ${d.issuesMonth.length} issue${d.issuesMonth.length === 1 ? '' : 's'} before they reached you or a customer, ` +
    `and saved your team about ${hours} hours (roughly ${dollars} in staff time, counted conservatively). ` +
    (d.allRunning ? `Everything is running normally.` : `One item needs attention — details on your dashboard.`)

  const card = (num: string, label: string) =>
    `<td style="border:1px solid #D9CFB9;background:#FBF7EC;padding:16px 18px;vertical-align:top">
      <div style="font-family:Georgia,serif;font-size:26px;color:#1B1A17">${num}</div>
      <div style="font-size:13px;color:#6B6558;margin-top:6px;line-height:1.5">${label}</div>
    </td>`

  const issues = d.issuesMonth.slice(0, 5).map(i =>
    `<tr><td style="font-family:monospace;font-size:11px;color:#8C8674;padding:8px 12px 8px 0;white-space:nowrap;vertical-align:top">${esc(i.occurred_on)}</td>
     <td style="font-size:14px;color:#1B1A17;padding:8px 0;line-height:1.5">${esc(i.summary)}</td></tr>`).join('')

  const next = d.roadmap.filter(r => r.state !== 'shipped').slice(0, 4).map(r =>
    `<li style="margin:6px 0;font-size:14px;color:#1B1A17">${r.state === 'in_progress' ? 'In progress' : 'Next up'}: ${esc(r.title)}</li>`).join('')

  const html = `
<div style="background:#F5EFE3;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto">
    <div style="font-family:Georgia,serif;font-size:20px;color:#1B1A17;margin-bottom:4px">Ridgeline <span style="color:#B58439">—</span> <em style="color:#185FA5">Knows</em></div>
    <div style="font-family:monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8E6325;margin:18px 0 6px">Monthly report · ${esc(d.monthLabel)}</div>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:#1B1A17;margin:0 0 14px">How things ran for ${esc(d.clientName)}</h1>
    <p style="font-size:15px;line-height:1.65;color:#1B1A17;margin:0 0 22px">${narrative}</p>

    <table role="presentation" width="100%" cellspacing="8" cellpadding="0" style="border-collapse:separate;margin-bottom:8px"><tr>
      ${card(`${hours} hrs`, 'of manual work your team didn’t have to do')}
      ${card(dollars, 'in staff time you didn’t spend')}
      ${card(String(d.issuesMonth.length), 'issues caught and fixed early')}
    </tr></table>
    <div style="font-family:monospace;font-size:11px;color:#8C8674;margin:0 0 24px">${formatHours(d.launchHours, true)} hrs and ${formatDollars(d.launchDollars, true)} since we started · ${d.issuesTotal} issues caught all-time</div>

    ${issues ? `<div style="font-family:monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8E6325;margin:0 0 8px">Caught &amp; fixed</div>
    <table role="presentation" style="border-collapse:collapse;margin-bottom:22px">${issues}</table>` : ''}

    ${next ? `<div style="font-family:monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8E6325;margin:0 0 8px">What’s next</div>
    <ul style="margin:0 0 24px;padding-left:18px">${next}</ul>` : ''}

    <a href="${esc(portalUrl)}" style="display:inline-block;background:#185FA5;color:#FBF7EC;text-decoration:none;padding:12px 22px;font-size:14px">See your live dashboard</a>

    <p style="font-size:12.5px;line-height:1.6;color:#6B6558;margin:26px 0 0;border-top:1px solid #D9CFB9;padding-top:14px">
      How I count this: I only count work someone on your team actually used to do, and I cut the
      total by ${Math.round(HAIRCUT * 100)}% so the numbers stay on the safe side. Your blended labor
      cost is $${d.laborRate}/hour. If anything here looks off, reply to this email and I’ll re-measure.
    </p>
  </div>
</div>`

  return { subject, html }
}
