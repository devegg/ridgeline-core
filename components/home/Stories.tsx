import { Reveal } from './Reveal'

const PRODUCTS = [
  {
    sector: 'Federal contracting · SaaS',
    size: 'Private beta · rfqhunter.com',
    title: 'Small suppliers were bidding blind on government contracts.',
    body: 'DLA suppliers pick through thousands of solicitations by hand, with no view of award history or the competition. RFQ Hunter is a federal-contract intelligence platform I built from the ground up: solicitation matching, award and pricing history, competitor intelligence, and demand forecasting — built on the government’s own published data.',
    outcome: 'Live in private beta. Four hundred merged pull requests and climbing.',
    href: 'https://www.rfqhunter.com',
    linkLabel: 'rfqhunter.com',
  },
  {
    sector: 'Data & infrastructure',
    size: 'Live · gridstrain.com',
    title: 'Watching the American power grid strain, in near real time.',
    body: 'GridStrain tracks stress on the U.S. power grid — regional demand, state-by-state electricity rates, and the gap between them. The data pipeline refreshes itself every hour, unattended. Built end-to-end: ingestion, database, and the site you can open right now.',
    outcome: 'Live. The data updates itself, hourly, whether anyone is watching or not.',
    href: 'https://gridstrain.com',
    linkLabel: 'gridstrain.com',
  },
  {
    sector: 'Consumer web',
    size: 'Live · movieslotmachine.com',
    title: 'Thirty minutes deciding what to watch. Pull the lever instead.',
    body: 'Movie Slot Machine ends the endless scroll: set a genre, pull the lever, get a film. A small, finished thing — designed, built, and shipped to production. Not every build has to be an operations platform.',
    outcome: 'Live. Deciding what to watch now takes eleven seconds.',
    href: 'https://movieslotmachine.com',
    linkLabel: 'movieslotmachine.com',
  },
  {
    sector: 'Decision framework · Publication',
    size: 'Live · therightbusinessfirst.com',
    title: 'A framework that rules out the wrong business before you fund it.',
    body: 'The Right Business First is a free, constraint-aware system: it starts from the operator’s real limits — hours, energy, temperament — and filters out the business models that will never fit, before any money goes in. Published as a complete, self-serve system with worksheets, prompt templates, and a full case study.',
    outcome: 'Complete and live — free, no account, fully self-service.',
    href: 'https://therightbusinessfirst.com',
    linkLabel: 'therightbusinessfirst.com',
  },
]

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
  {
    sector: 'Content & media',
    size: 'Solo content creator',
    title: 'Every comment on a video — pulled, searchable, exportable.',
    body: 'A content creator needed to work with their audience in bulk, not scroll comments one screen at a time. I built a custom app that pulls every comment and reply from any public video through YouTube’s official Data API, then lets them search, sort, and export the whole set to CSV or JSON.',
    outcome: 'From a buried comment thread to a working spreadsheet in one step.',
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
            Client work and my own products,<br />
            <em>plainly</em> described.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            Client names are withheld; outcomes are not. My own products are named — click
            through and see them running. If a serious conversation is underway, references are
            available on request.
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

        <Reveal delay={1}>
          <p className="lede" style={{ marginTop: 56 }}>
            And four products of my own — built, shipped, and running today. The full
            portfolio, with the stories behind each build, lives at <a href="/work">/work</a>:
          </p>
        </Reveal>

        {PRODUCTS.map((p, i) => (
          <Reveal key={p.href} delay={1}>
            <article className="story">
              <div>
                <div className="story__num">{String(STORIES.length + i + 1).padStart(2, '0')}</div>
                <div className="story__meta">
                  <span>{p.sector}</span>
                  {p.size}
                </div>
              </div>
              <div>
                <h3 className="story__title">
                  <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                    {p.title}
                  </a>
                </h3>
                <p className="story__body">{p.body}</p>
              </div>
              <div>
                <p className="story__outcome">
                  {p.outcome}{' '}
                  <a href={p.href} target="_blank" rel="noopener noreferrer">
                    {p.linkLabel} →
                  </a>
                </p>
              </div>
            </article>
          </Reveal>
        ))}

        <Reveal delay={1}>
          <p className="lede" style={{ marginTop: 56 }}>
            The full write-ups — what was actually wrong, what I built, and what changed —
            live in the <a href="/papers">papers</a>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
