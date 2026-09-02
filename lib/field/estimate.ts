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

/**
 * Year one is billed MONTHLY, against what the system actually saved that
 * month — so the estimator leads with a monthly figure, because that is the
 * number the owner will actually see on an invoice. The twelve-month total is
 * still `commission()` above, and is still the card's "$10,000 → $2,500".
 */
export function monthlyShare(firstYearFee: number): number {
  return firstYearFee / 12
}

/**
 * After twelve months the 25% share stops and this replaces it: a flat base
 * per client, plus a per-automation amount priced at build time from that
 * automation's own footprint.
 *
 * Only the base is a fixed number, which is why anything showing it to a
 * client must say "from". Owner-set 2026-09-02; see
 * ridgeline-workspace docs/business-dev/SAVINGS-SHARE-MODEL.md §2.7.
 */
export const MAINTENANCE_BASE_MONTHLY = 40

/** A visit is the sum of its tasks. The owner watches THIS number build. */
export function visitTotals(tasks: EstimateInput[]): { cost: number; recovered: number; fee: number } {
  const cost = tasks.reduce(
    (sum, t) => sum + annualCost(t.minutes_each, t.times_per_week, t.hourly_rate),
    0
  )
  const recovered = cost * (1 - HAIRCUT)
  return { cost, recovered, fee: recovered * COMMISSION_RATE }
}

/**
 * One blended hourly rate for a client, from the rates measured task by task
 * on site. Weighted by annual minutes, so the task that eats the most time
 * carries the most weight — an average of the raw rates would let a rare
 * $90/hr task drag up a client whose real cost of labour is $28.
 *
 * Every input rate is already inside the $5–$500 bounds the form and the
 * CHECK constraints enforce, so the blend is too: a weighted mean cannot
 * leave the range of its inputs.
 */
export function blendedRate(tasks: EstimateInput[]): number | null {
  let minutes = 0
  let weighted = 0
  for (const t of tasks) {
    const w = t.minutes_each * t.times_per_week
    if (w <= 0) continue
    minutes += w
    weighted += w * t.hourly_rate
  }
  if (minutes === 0) return null
  return Math.round((weighted / minutes) * 100) / 100
}
