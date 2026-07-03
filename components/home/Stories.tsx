import { Reveal } from './Reveal'

const STORIES = [
  {
    sector: 'Real estate brokerage',
    size: 'Multi-agent team',
    title: 'An inbox drowning in noise — missed emails costing real money.',
    body: 'A real estate broker had more than 300,000 messages in the inbox, and the ones that mattered kept getting buried. Missed emails were costing real money. I processed the entire backlog, built a filter system that eliminated 60 percent of the daily noise, and trained the owner so the problem stayed solved.',
    outcome: 'The broker now finds critical messages. The system runs itself.',
  },
  {
    sector: 'Real estate brokerage',
    size: 'Full office operations',
    title: 'A CRM that matched how their business actually worked.',
    body: 'Every off-the-shelf option had a deal-breaker. The solution was a custom system built from the ground up: client tracking, sales pipeline, service requests, and automation for the tasks that were eating the team\'s time every day.',
    outcome: 'Within six months, productivity was up 30% and customer satisfaction scores had improved by 20%.',
  },
  {
    sector: 'Defense contractor',
    size: '2 employees · Precision parts operation',
    title: 'Everything lived in one person\'s head — running on paper and spreadsheets.',
    body: 'A two-person precision parts operation was running on paper forms, spreadsheets, and email. I designed and built a full operations platform that replaced the entire system: live job tracking, document processing, automated reconciliation of government payments, inquiry management with deadline alerts, and a complete audit trail on every transaction.',
    outcome: 'From concept to production in active daily use. One developer. One client. Zero shortcuts.',
  },
]

export function Stories() {
  return (
    <section className="stories" id="proof">
      <div className="container">
        <Reveal>
          <div className="eyebrow">03 — Proof</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Three engagements,<br />
            <em>plainly</em> described.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            Client names are held back; outcomes are not. If a serious conversation is underway,
            references are available on request.
          </p>
        </Reveal>

        {STORIES.map((s, i) => (
          <Reveal key={i} delay={1}>
            <article className="story">
              <div>
                <div className="story__num">{String(i + 1).padStart(2, '0')}</div>
                <div className="story__meta">
                  <span>{s.sector}</span>
                  {s.size}
                </div>
              </div>
              <div>
                <h3 className="story__title">{s.title}</h3>
                <p className="story__body">{s.body}</p>
              </div>
              <div>
                <p className="story__outcome">{s.outcome}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
