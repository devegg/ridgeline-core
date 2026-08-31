import { Reveal } from './Reveal'

// The five service lines, from docs/business-dev/reviews/fable-service-catalogue.md.
// Ordered for recognition, not for margin: the ones an owner spots in their own
// week come first, the most abstract one last.
const LINES = [
  {
    name: 'Intake',
    rule: 'Getting what arrives into the system it belongs in.',
    body:
      'Information shows up as an email, a PDF, a paper form, or a download from somebody else’s portal. Then a person retypes it into your system. I build the path that lands it there automatically, and marks it so it never lands twice.',
    looks: [
      'The form a customer prints, fills out, signs, and scans back — then somebody keys in by hand.',
      'A delivery receipt photographed in a truck cab, retyped days later, invoiced later still.',
      'An aging report that comes out as a PDF and gets turned back into a spreadsheet by hand, every month.',
    ],
    trades: 'Trucking · Restaurants · Dental · Construction · Hotels · Self-storage',
  },
  {
    name: 'Reconciliation',
    rule: 'Making two systems agree — and flagging what doesn’t.',
    body:
      'Two records are supposed to match: the point of sale and the bank, the booking platform and the accounting file, the statement and the folio. I build the comparison that runs on its own and reports every difference. It reports. It does not overwrite. Your data stays yours.',
    looks: [
      'Payouts from a delivery app that never quite line up with the tickets.',
      'A card payment the platform marked as processed that never actually arrived.',
      'The spreadsheet three people update by hand, where nobody fully trusts the numbers.',
    ],
    trades: 'Every trade I have looked at — this one turns up everywhere',
  },
  {
    name: 'The unbilled-work sweep',
    rule: 'Finding work that happened but never became money.',
    body:
      'Most operations have a queue somewhere: work that is finished, and money that was never billed for it. It is rarely one big miss. It is a standing list that nobody owns. I build the report — and, more to the point, put a name and a schedule on it.',
    looks: [
      'Treatment that was diagnosed and never got scheduled.',
      'A load delivered without the paperwork that lets you invoice it.',
      'Checks left open at the end of a shift; storage days that only get charged when somebody remembers.',
    ],
    trades: 'Dental · Medical · Trucking · Restaurants · Marine · Construction',
  },
  {
    name: 'Deadline and document chains',
    rule: 'Running the dated sequence, and keeping the proof.',
    body:
      'Some sequences are set by a contract or a statute — a notice on one day, another two weeks later, a document that expires on a date somebody has to remember. I automate the running of the sequence and the evidence that it ran. I build the tracker and the proof. Whether the rule says day thirty is a question for your attorney, and I will tell you so.',
    looks: [
      'A delinquency sequence at a storage facility, where getting a date wrong is a legal problem.',
      'Certificates of insurance expiring across a dozen subcontractors.',
      'Change orders sitting unsigned while the work goes ahead anyway.',
    ],
    trades: 'Self-storage · Construction · Trucking · Marine',
  },
  {
    name: 'The encoding audit',
    rule: 'Writing down the decision the software cannot see.',
    body:
      'Every kind of money that comes in has to be classified as something. A deposit, a gift card, a grant, a retainer. Your software has a default, the default is often wrong for your business, and nobody checks it because it is not anybody’s job. This is a fixed-scope, fixed-price review: I document what each kind of incoming money is and where it is set to land, and hand you a register your CPA or auditor can rule on. I do not make the call. I write down what the call is.',
    looks: [
      'Gift cards booked as income the day they are sold.',
      'Two platforms in the same industry with opposite defaults for the same deposit.',
      'Grant money with conditions attached that nobody has written down in one place.',
    ],
    trades: 'Retail · Salons · Construction · Marine · Nonprofits · Law · Dental',
  },
]

export function ServiceLines() {
  return (
    <section className="services band band--paper band--accent" id="services">
      <div className="container">
        <Reveal>
          <div className="eyebrow">01 &mdash; What I do</div>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="section-title">
            Five things I fix,<br />
            <em>over and over.</em>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="lede">
            I spent months going trade by trade through how small operations actually run —
            what the software does, what it refuses to do, and where a person ends up filling
            the gap by hand. The same five gaps kept turning up. Not all five will apply to you.
            Most owners recognize one or two immediately.
          </p>
        </Reveal>

        <div className="service-grid">
          {LINES.map((l, i) => (
            <Reveal key={l.name} delay={1}>
              <article className="service">
                <header className="service__head">
                  <div className="service__num">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="service__name">{l.name}</h3>
                    <p className="service__rule">{l.rule}</p>
                  </div>
                </header>
                <p className="service__body">{l.body}</p>
                <div className="service__looks">
                  <div className="service__looks-label">What it looks like</div>
                  <ul>
                    {l.looks.map((x, j) => <li key={j}>{x}</li>)}
                  </ul>
                </div>
                <div className="service__trades">{l.trades}</div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={1}>
          <p className="lede services__close">
            There is also a list of things I will not sell you — work that needs a licence I
            do not hold, and work somebody else already does well and cheaply. If what you need
            is on that list, I will tell you on the first call and point you at whoever does it
            properly.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
