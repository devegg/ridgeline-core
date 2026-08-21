import { HAIRCUT } from '../portal/value.ts'

/**
 * On-site estimator math. The ONLY new arithmetic in this feature — the
 * haircut and the dollar formatting are inherited from lib/portal/value.ts
 * so the number Brian says in the field and the number the portal shows a
 * year later cannot drift apart.
 *
 * Relative import (not '@/') on purpose: scripts/test-estimate.mjs loads
 * this file directly through node's type stripper, which does not resolve
 * the tsconfig alias.
 */

export type EstimateInput = {
  minutes_each: number
  times_per_week: number
  hourly_rate: number
}

/** What the task costs the business today, per year, before any haircut. */
export function annualCost(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return (minutesEach * timesPerWeek * 52 * hourlyRate) / 60
}

/** What automating it would conservatively recover — the portal's 30% held back. */
export function annualRecovered(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return annualCost(minutesEach, timesPerWeek, hourlyRate) * (1 - HAIRCUT)
}

/** Brian's share, from the card: "If I save you $10,000, I keep $2,500."
    Charged against what is RECOVERED, not the raw cost — he is paid on
    savings, and the post-haircut number is the one he can defend. */
export const COMMISSION_RATE = 0.25

export function commission(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return annualRecovered(minutesEach, timesPerWeek, hourlyRate) * COMMISSION_RATE
}

/** A visit is the sum of its tasks. The owner watches THIS number build. */
export function visitTotals(tasks: EstimateInput[]): { cost: number; recovered: number; fee: number } {
  const cost = tasks.reduce(
    (sum, t) => sum + annualCost(t.minutes_each, t.times_per_week, t.hourly_rate),
    0
  )
  const recovered = cost * (1 - HAIRCUT)
  return { cost, recovered, fee: recovered * COMMISSION_RATE }
}
