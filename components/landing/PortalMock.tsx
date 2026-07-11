import type { LandingIndustry } from '@/lib/landing-data'

/** A live-rendered sample of the client portal dashboard, in the site's own
    design language. Always labeled "Sample data" — the numbers illustrate
    what the portal shows, they are not client claims. */
export function PortalMock({ mock, industry }: { mock: LandingIndustry['mock']; industry: string }) {
  return (
    <div className="pmock" aria-label={`Sample client portal dashboard for ${industry.toLowerCase()}`}>
      <div className="pmock__top">
        <span className="pmock__brand">
          Ridgeline <em>· client portal</em>
        </span>
        <span className="pmock__chip">Sample data</span>
      </div>
      <div className="pmock__hours">
        <span className="pmock__hours-num">{mock.hours}</span>
        <span className="pmock__hours-label">reclaimed this month — the math behind it, one click away</span>
      </div>
      <div className="pmock__rows">
        {mock.rows.map((r) => (
          <div className="pmock__row" key={r.label}>
            <span className="pmock__dot" aria-hidden="true" />
            <span className="pmock__label">{r.label}</span>
            <span className="pmock__meta">{r.meta}</span>
          </div>
        ))}
      </div>
      <div className="pmock__foot">All quiet. Everything ran.</div>
    </div>
  )
}
