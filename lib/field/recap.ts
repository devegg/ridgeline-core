import { annualCost, visitTotals, type EstimateInput } from './estimate.ts'
import { formatDollars } from '../portal/value.ts'

/**
 * The visit recap email.
 *
 * Written to be FORWARDED (owner decision, 2026-08-21): it goes to Brian, and
 * he sends it on to the business owner. So it carries nothing internal — no
 * prospect status, no pipeline language, no notes-to-self — and says only what
 * the owner already watched being built on the phone.
 *
 * Which figures appear is not a style choice. D21 puts cost and the one-time
 * fee on the screen by default and keeps the recovered figure behind a tap;
 * this email shows the same two and the same disclaimer, word for word. An
 * email that quotes a number the owner never saw would be a new claim made in
 * writing, which is exactly what D21 exists to prevent.
 *
 * Relative imports on purpose — scripts/test-recap.mjs loads this through
 * node's type stripper, which does not resolve the tsconfig alias.
 */

export type RecapTask = EstimateInput & {
  label: string
  who: string | null
}

export type RecapInput = {
  businessName: string
  contactName: string | null
  visitedOn: string // YYYY-MM-DD
  tasks: RecapTask[]
}

/** 'YYYY-MM-DD' built from its parts — parsing it gives UTC midnight, which
    reads as the previous day anywhere west of Greenwich. */
export function recapDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function recapSubject(input: RecapInput): string {
  return `What we worked out at ${input.businessName}`
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function recapHtml(input: RecapInput): string {
  const totals = visitTotals(input.tasks)
  const greeting = input.contactName ? `Hi ${esc(input.contactName.split(/\s+/)[0])},` : 'Hi,'

  const rows = input.tasks
    .map(t => {
      const cost = annualCost(t.minutes_each, t.times_per_week, t.hourly_rate)
      const who = t.who ? ` <span style="color:#6B6558">— ${esc(t.who)}</span>` : ''
      return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #E5DCC7;font-size:15px;color:#1B1A17">
    ${esc(t.label)}${who}<br>
    <span style="font-size:13px;color:#8C8674">
      ${t.minutes_each} minutes, ${t.times_per_week} times a week
    </span>
  </td>
  <td style="padding:10px 0;border-bottom:1px solid #E5DCC7;text-align:right;white-space:nowrap;font-size:15px;color:#1B1A17">
    ${formatDollars(cost)}/yr
  </td>
</tr>`
    })
    .join('\n')

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;color:#1B1A17;line-height:1.55">
  <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8C8674;margin:0 0 18px">
    ${esc(input.businessName)} &middot; ${esc(recapDate(input.visitedOn))}
  </p>

  <p>${greeting}</p>

  <p>Thanks for your time. Here is what we counted up together,
  so you have it in writing.</p>

  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tbody>
${rows}
    </tbody>
  </table>

  <p style="font-size:16px;margin:0 0 6px">
    <strong>What this is costing you now: ${formatDollars(totals.cost)} a year.</strong>
  </p>
  <p style="font-size:16px;margin:0 0 20px">
    My fee if I take it on: <strong>${formatDollars(totals.fee)}</strong>, charged once.
  </p>

  <p style="font-size:13px;color:#6B6558;background:#F5EFE3;padding:14px 16px;border-radius:6px;margin:0 0 20px">
    A rough estimate, not a quote. I hold back 30% of the savings in my own
    figures &mdash; I would rather beat the number than miss it. The yearly
    numbers stay estimates until we count the real thing. My fee is 25% of the
    first year&rsquo;s savings, charged once, not every year, and that rate is
    firm as long as these counts hold up. Anything new later is a change order
    we price together.
  </p>

  <p>If the counts look wrong, tell me &mdash; I would rather fix them now than
  build against a bad number.</p>

  <p style="margin-top:24px">Brian Boyd<br>
  <span style="color:#6B6558">Ridgeline Knows &middot; ridgelineknows.com</span></p>
</div>`
}
