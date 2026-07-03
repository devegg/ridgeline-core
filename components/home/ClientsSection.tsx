import { Reveal } from './Reveal'

const CLIENTS = [
  {
    label: 'Industry',
    title: 'Real estate agencies',
    body: 'Brokers managing listings, agents, transactions, and communication across teams. Paper and email workflows that slow down the deal.',
  },
  {
    label: 'Industry',
    title: 'Medical and dental offices',
    body: 'Patient intake, scheduling, billing, and records all running on different systems or no system at all. Inefficiencies directly impact care.',
  },
  {
    label: 'Industry',
    title: 'Property management & trades',
    body: 'Contractors, trade businesses, and property managers juggling work orders, invoicing, and scheduling. Field operations disconnected from the office.',
  },
]

export function ClientsSection() {
  return (
    <section className="clients" id="clients">
      <div className="container">
        <Reveal>
          <div className="eyebrow">02 — Who I work with</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Small business owners<br />
            <em>in the Lowcountry</em> and beyond.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            I focus on business owners close enough to the operation to feel every inefficiency
            personally. If your business runs on people, paperwork, and follow-up, we have
            something to talk about.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="clients-grid">
            {CLIENTS.map((c, i) => (
              <div className="client-card" key={i}>
                <div className="client-card__label">{c.label} · 0{i + 1}</div>
                <div className="client-card__title">{c.title}</div>
                <div className="client-card__body">{c.body}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
