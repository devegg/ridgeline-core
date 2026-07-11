import type { Metadata } from 'next'
import { PULSE_CHECK } from '@/lib/landing-data'
import { IndustryLanding } from '@/components/landing/IndustryLanding'

/** The generic, no-industry landing page — where untargeted visitors and the
    404 net's "start here" link land. Industry card words serve their own
    pages; this is the catch-all version of the same offer. */

export const metadata: Metadata = {
  title: 'A pulse check on your operation — Ridgeline Knows',
  description: PULSE_CHECK.headline,
  alternates: { canonical: 'https://www.ridgelineknows.com/customer-pulse-check' },
}

export default function PulseCheckPage() {
  return <IndustryLanding entry={PULSE_CHECK} />
}
