import type { Automation, AutomationActivity } from '@/lib/types'

/**
 * The honest-math layer. Single source of truth for every surface that
 * shows client value (dashboard today; monthly report and case studies
 * render from these same numbers later).
 *
 * Rules (docs/plans/BUILD-PLAN-portal-home-dashboard.md):
 * - 30% conservative haircut, hard-coded here, stated in the client copy.
 * - Rounded, hedged numbers only. No decimals — false precision reads as
 *   fake or fragile to a numerate buyer.
 */
export const HAIRCUT = 0.3

/** Raw minutes represented by a batch of processed items, before the haircut. */
function rawMinutes(items: number, baselineMinutesPerItem: number): number {
  return items * baselineMinutesPerItem
}

/** Hours saved after the conservative haircut. */
export function hoursSaved(items: number, baselineMinutesPerItem: number): number {
  return (rawMinutes(items, baselineMinutesPerItem) * (1 - HAIRCUT)) / 60
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

/** "~14" this month, "~160" since launch. */
export function formatHours(hours: number, sinceLaunch = false): string {
  const rounded = sinceLaunch ? roundTo(hours, 10) : Math.round(hours)
  return `~${rounded.toLocaleString()}`
}

/** "~$900" this month, "~$5,000" since launch. */
export function formatDollars(dollars: number, sinceLaunch = false): string {
  const rounded = sinceLaunch ? roundTo(dollars, 1000) : roundTo(dollars, 100)
  return `~$${rounded.toLocaleString()}`
}

export interface ValueTotals {
  monthHours: number
  monthDollars: number
  monthItems: number
  launchHours: number
  launchDollars: number
  launchItems: number
}

/**
 * Aggregate activity rows against their automations' baselines.
 * `monthStart` is an ISO date (YYYY-MM-DD), first of the current month.
 */
export function computeTotals(
  automations: Pick<Automation, 'id' | 'baseline_minutes_per_item'>[],
  activity: Pick<AutomationActivity, 'automation_id' | 'activity_on' | 'items_processed'>[],
  laborRate: number,
  monthStart: string,
): ValueTotals {
  const baseline = new Map(automations.map(a => [a.id, Number(a.baseline_minutes_per_item)]))

  let monthHours = 0, monthItems = 0, launchHours = 0, launchItems = 0

  for (const row of activity) {
    const minutesPer = baseline.get(row.automation_id)
    if (!minutesPer) continue
    const hours = hoursSaved(row.items_processed, minutesPer)
    launchHours += hours
    launchItems += row.items_processed
    if (row.activity_on >= monthStart) {
      monthHours += hours
      monthItems += row.items_processed
    }
  }

  return {
    monthHours,
    monthDollars: monthHours * laborRate,
    monthItems,
    launchHours,
    launchDollars: launchHours * laborRate,
    launchItems,
  }
}

/** "6 minutes ago" / "3 hours ago" / "yesterday" / "Jul 8" — plain, honest. */
export function relativeLabel(iso: string | null): string {
  if (!iso) return 'no activity yet'
  const then = new Date(iso).getTime()
  const mins = Math.floor((Date.now() - then) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 8) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
