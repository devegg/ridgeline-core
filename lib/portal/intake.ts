/**
 * The written audit intake — one fixed question set, shared by the public
 * intake page (what the prospect fills in) and the assessment detail (what
 * the owner reads). Answers live on assessments.intake_answers as jsonb in
 * exactly this shape.
 */

export const INTAKE_PAINS = [
  'A report someone assembles by hand every week',
  'Paper forms or PDFs that get re-typed into software',
  'An inbox where requests get buried or lost',
  'A spreadsheet several people edit and nobody trusts',
  'Data that has to be copied between two systems',
  'Customers waiting on answers that are always the same',
] as const

export interface IntakeBaseline {
  task: string
  minutes_each: number | null
  times_per_week: number | null
  who: string
}

export interface IntakeAnswers {
  business_name: string
  contact_name: string
  contact_role: string
  email: string
  phone: string
  team_size: string
  pains: string[]          // subset of INTAKE_PAINS + free additions
  worst_time_eater: string // free text
  tools: string            // free text ("QuickBooks, Gmail, a shared drive")
  baselines: IntakeBaseline[]
  anything_else: string
}

export function emptyBaseline(): IntakeBaseline {
  return { task: '', minutes_each: null, times_per_week: null, who: '' }
}

/** Weekly hours a single baseline row represents (no haircut — raw). */
export function baselineWeeklyHours(b: IntakeBaseline): number | null {
  if (!b.minutes_each || !b.times_per_week) return null
  return (b.minutes_each * b.times_per_week) / 60
}
