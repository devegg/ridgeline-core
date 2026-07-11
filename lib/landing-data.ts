/**
 * Industry landing pages — the card-word system.
 *
 * The back of the business card reads `ridgelineknows.com/___________`;
 * Brian handwrites one of these words depending on who he's talking to.
 * Every word serves its own page (never a redirect — per-page analytics
 * and SEO are the point). Aliases 308 to the canonical word. Unknown
 * words fall through to the not-found net, which lists the real ones.
 *
 * Copy rules: owner's language, no invented statistics, no prices.
 * Dashboard mock numbers are illustrative and always rendered under a
 * visible "Sample data" chip.
 */

export type LandingIndustry = {
  slug: string
  aliases: string[]
  name: string
  /** How the industry reads inside the reserved-review sentence, when
      name.toLowerCase() would mangle an acronym (e.g. HVAC). */
  reviewLabel?: string
  headline: string
  lede: string
  pains: { title: string; body: string }[]
  /** Rows shown in the sample portal dashboard mock. */
  mock: { hours: string; rows: { label: string; meta: string }[] }
  /** Options for the contact form's "Which is closest" dropdown. */
  situations: string[]
}

export const LANDING_INDUSTRIES: LandingIndustry[] = [
  {
    slug: 'vrm',
    aliases: ['vacation', 'rentals'],
    name: 'Vacation rental management',
    headline: 'Owner statements shouldn’t eat your Sundays.',
    lede:
      'The Grand Strand gives you about four peak months to make the year. Month-end statements built by midnight, Saturday turnovers run from a group text, a guest inbox that never sleeps — one missed clean or one double-booking in July costs an owner, a review, or worse. I build systems that carry that load automatically, so the season runs on rails instead of adrenaline.',
    pains: [
      {
        title: 'Month-end swallows days: statements, receipts, and the trust account.',
        body: 'Pulling revenue by channel, matching receipts to properties, hand-building a statement for every owner — and in South Carolina that ledger reconciles against a trust account, so a slip isn’t just an angry phone call. It’s a licensing matter.',
      },
      {
        title: 'The cleaning schedule lives in a group text.',
        body: 'Saturday changeover in July: checkout at ten, check-in at four, and the board is texts and memory. One missed turn is a guest walking into a dirty house — a one-star review you keep forever.',
      },
      {
        title: 'Two guests, one beach house, the Fourth of July.',
        body: 'When calendars sync by iCal lag and hand-blocked dates, a double-booking is always one busy weekend away — and in peak season there’s no comparable unit to move anyone into.',
      },
      {
        title: 'When a storm spins up, your whole book messages at once.',
        body: 'Every guest on the calendar asking about refunds and evacuation in the same afternoon, on top of the thirty routine questions a day — all answered by hand, from somebody’s personal phone.',
      },
    ],
    mock: {
      hours: '11.4 hrs',
      rows: [
        { label: 'Owner statement prep & reconciliation', meta: '43 drafts ready for licensed review' },
        { label: 'Turnover board sync', meta: 'Saturday: 14 turns, all assigned' },
        { label: 'Guest message triage', meta: '31 routine handled · 2 flagged to you' },
      ],
    },
    situations: [
      'Month-end statements take days',
      'Turnovers run on texts and memory',
      'Double-bookings and calendar sync',
      'Guest messages never stop',
      'Something else',
    ],
  },
  {
    slug: 'pm',
    aliases: ['property'],
    name: 'Property management',
    headline: 'Work orders, dues, and owner statements that move without you pushing.',
    lede:
      'Long-term rentals, HOAs, or both: the back office is follow-up work. Month-end closes that drag deep into the month, maintenance living in texts and on a whiteboard, dues notices going out late and inconsistently — and every June through November, a storm in the Gulf can turn the whole office into a claims-documentation shop. I build the systems that do the pushing, with a person signing off on anything that matters.',
    pains: [
      {
        title: 'Month-end close drags deep into the month — and owners still catch errors.',
        body: 'Three-way trust reconciliation in QuickBooks plus spreadsheets, then statements assembled and emailed one by one. In South Carolina the trust account is a licensing matter with monthly reconciliation required, so “a little behind” is exposure, not just delay.',
      },
      {
        title: 'Maintenance lives in texts, voicemails, and a whiteboard.',
        body: 'Requests come in five ways, vendors get chased by phone, and nobody can prove what got done when. Slow maintenance is what loses tenants — and an untracked request is how a small repair becomes a legal problem.',
      },
      {
        title: 'Dues, late fees, and notices go out late and inconsistently — and the board notices.',
        body: 'Manual posting, hand-written reminders, a stale aging report at every meeting. Inconsistent enforcement isn’t just sloppy; it’s the kind of thing that gets challenged.',
      },
      {
        title: 'Hurricane season runs your office for six months a year.',
        body: 'Wind-versus-flood deductibles, dated photos, adjuster reports, contractor bids, anxious absentee owners — all tracked by hand, stacked on top of the normal workload, every June through November.',
      },
    ],
    mock: {
      hours: '9.7 hrs',
      rows: [
        { label: 'Work-order intake & dispatch', meta: '12 open · status texts sent · audit trail kept' },
        { label: 'Owner statement assembly', meta: 'Drafts ready for your review' },
        { label: 'Dues reminder sequence', meta: '17 sent · 2 escalations flagged to you' },
      ],
    },
    situations: [
      'Month-end close drags for weeks',
      'Work orders live on a whiteboard',
      'Dues and notices slip',
      'Storm paperwork buries us',
      'Something else',
    ],
  },
  {
    slug: 'real',
    aliases: ['realty'],
    name: 'Real estate',
    headline: 'The deal moves fast. The paperwork shouldn’t slow it down.',
    lede:
      'Coastal brokerages and teams run on out-of-state buyers who browse at 9 p.m., a summer surge of simultaneous closings, and deadlines where a typo costs someone their earnest money. I’ve built for brokers before: the system keeps the deal moving so the people can sell.',
    pains: [
      {
        title: 'Deadlines live in someone’s head and a spreadsheet.',
        body: 'Inspection, due diligence, financing, closing — hand-calculated on every contract and remembered under pressure. One missed date can cost a client their earnest money, and it surfaces in the 48 hours before a Friday closing.',
      },
      {
        title: 'The lead comes in Saturday night. The answer goes out Monday.',
        body: 'A buyer in Ohio inquires at 9 p.m. from your listing — and by the time anyone replies, they’ve already talked to three other agents. The first response usually wins, and nobody is watching the inbox from a showing.',
      },
      {
        title: 'Closing day means split math, a CDA, and QuickBooks — by hand.',
        body: 'Splits, caps, franchise fees, and referral cuts recalculated for every deal, a disbursement authorization typed for the attorney, then all of it entered again into the books. Three chances to get the same number wrong.',
      },
      {
        title: 'The same deal gets typed into three systems.',
        body: 'Parties, property, price, dates — keyed into the transaction platform, the CRM, and accounting, none of which talk to each other. You’re paying for all three and still doing the courier work yourself.',
      },
    ],
    mock: {
      hours: '8.9 hrs',
      rows: [
        { label: 'Contract-to-close checklists', meta: '7 active files · deadlines auto-calculated' },
        { label: 'Lead acknowledgment & routing', meta: 'Sat 9:14p inquiry · answered in 90 seconds' },
        { label: 'Commission & CDA prep', meta: 'Draft ready for broker sign-off' },
      ],
    },
    situations: [
      'Deadlines tracked by memory',
      'Leads go cold after hours',
      'Closing-day math by hand',
      'Same deal typed into three systems',
      'Something else',
    ],
  },
  {
    slug: 'trades',
    aliases: ['construction', 'builders'],
    name: 'Construction & trades',
    headline: 'You bid it and you build it. Chasing your own money shouldn’t be a third job.',
    lede:
      'Every draw that sits an extra month is your money in someone else’s bank account — and on a builder’s margin, one kicked-back pay app or one mispriced job eats the profit from the next three. The jobsite runs all day; the paperwork waits for night. I build systems that handle the office side while you’re on the site side.',
    pains: [
      {
        title: 'A draw gets kicked back over one missing lien waiver.',
        body: 'The pay app has to tie out to the penny, every sub’s waiver attached, photos included — one gap and the whole package bounces, and you wait another month to get paid. Meanwhile South Carolina’s 90-day lien clock doesn’t pause.',
      },
      {
        title: 'You find out a job lost money after it’s done.',
        body: 'Hours and receipts ride around in the truck, get keyed in days later, and land uncoded. The overrun that could have been caught in week three shows up at closeout instead.',
      },
      {
        title: 'Bids get built at the kitchen table, at night.',
        body: 'Plan set, highlighter, spreadsheet — then five subs to call and their numbers to line up. Hours per bid, several due the same week, and most of it spent on jobs that go to someone else.',
      },
      {
        title: 'Punch items live on a sticky note, and your retainage waits.',
        body: 'Walkthrough notes get transcribed, sorted by trade, and emailed from memory. Until every item is verifiably closed, five or ten percent of the contract sits in someone else’s account.',
      },
    ],
    mock: {
      hours: '10.2 hrs',
      rows: [
        { label: 'Draw package assembly', meta: 'SOV + waivers + photos · 1 missing waiver flagged' },
        { label: 'Field-to-books job costing', meta: 'Live across 5 jobs · one trending over' },
        { label: 'Punch-list routing', meta: '9 items by trade · 3 closed today' },
      ],
    },
    situations: [
      'Draws bounce and payment waits',
      'Job costs arrive too late',
      'Bids eat my nights',
      'Retainage stuck on punch items',
      'Something else',
    ],
  },
  {
    slug: 'home',
    aliases: ['hvac', 'plumbing', 'pest', 'pools', 'lawn'],
    name: 'HVAC & home services',
    reviewLabel: 'HVAC and home services',
    headline: 'The work gets done. The money leaks out the seams.',
    lede:
      'The extra parts that never make the bill. The maintenance plan nobody renewed. The invoice that aged a month. The truck that rolled to an empty house. None of it shows up as one big loss — it shows up as a business working twice as hard for the same money. I build the systems that close the seams.',
    pains: [
      {
        title: 'The extra work never makes it onto the invoice.',
        body: 'The add-on part, the after-hours trip, the second visit — noted on paper or in the tech’s head, gone by the time the office builds the bill. Work you already did, money you never see.',
      },
      {
        title: 'You sold the maintenance plans. Nobody tracks them.',
        body: 'Whose tune-up is due, whose renewal is this month, whose card on file just expired — the steadiest revenue you have, quietly canceling itself while everyone’s busy.',
      },
      {
        title: 'The invoice goes out late, then it just sits.',
        body: 'Job closes Tuesday, bill goes out Friday, paid whenever. Then winter comes and you’re calling people for money in the slow season, financing your own work in the meantime.',
      },
      {
        title: 'One no-show at 10 a.m. and the route falls apart.',
        body: 'A customer who isn’t home is a truck roll you paid for and an afternoon of re-shuffling by phone. Confirmations and reschedule links are exactly the kind of thing a machine should be doing.',
      },
    ],
    mock: {
      hours: '12.1 hrs',
      rows: [
        { label: 'Job close → same-day invoice', meta: '9 sent today · extras captured at the truck' },
        { label: 'Agreement renewals & card checks', meta: '17 due · 3 expired cards caught' },
        { label: 'Appointment confirmations', meta: '31 confirmed · 1 reschedule caught early' },
      ],
    },
    situations: [
      'Extras never make the invoice',
      'Maintenance plans slip away',
      'Invoices lag and AR piles up',
      'The schedule blows up daily',
      'Something else',
    ],
  },
  {
    slug: 'med',
    aliases: ['dental'],
    name: 'Medical & dental',
    headline: 'The front desk shouldn’t retype what the patient already wrote.',
    lede:
      'Independent practices lose clinical time to clerical work: intake forms keyed in twice, insurance checked by phone, recall lists worked by hand. I build systems that give the front desk its day back, with patient data handled carefully and compliance first.',
    pains: [
      {
        title: 'Paper intake typed into the system, again.',
        body: 'The patient fills out the clipboard, the front desk retypes it, and every retype risks an error in a record that matters.',
      },
      {
        title: 'Insurance verification, one phone call at a time.',
        body: 'Eligibility checks and benefits breakdowns eat hours before the patient ever sits down, and surprises surface at billing.',
      },
      {
        title: 'Recalls and no-shows managed from a printed list.',
        body: 'Empty chair time is the most expensive time in the building, and filling it depends on someone working a list between everything else.',
      },
    ],
    mock: {
      hours: '9.3 hrs',
      rows: [
        { label: 'Digital intake → record sync', meta: '22 patients · 0 retyped forms' },
        { label: 'Eligibility pre-check', meta: 'Tomorrow’s schedule verified' },
        { label: 'Recall & no-show outreach', meta: '31 reminders sent · 5 rebooked' },
      ],
    },
    situations: [
      'Intake gets typed twice',
      'Insurance checks eat the morning',
      'No-shows and recalls slip',
      'Something else',
    ],
  },
  {
    slug: 'food',
    aliases: ['dine'],
    name: 'Hospitality & restaurants',
    headline: 'Invoices, counts, and schedules, without the 2 a.m. spreadsheet.',
    lede:
      'Independent restaurants and small lodging run on thin margins and long days. The paperwork that protects the margin — invoices, inventory, the daily numbers — is exactly what there’s no time for. I make it run itself.',
    pains: [
      {
        title: 'Supplier invoices entered by hand, or not at all.',
        body: 'A stack of paper invoices means food cost is a guess until the accountant says otherwise, weeks later.',
      },
      {
        title: 'Ordering and counts that live in someone’s head.',
        body: 'Par levels, prep lists, and orders depend on whoever knows the kitchen best being there that day.',
      },
      {
        title: 'The daily close done tired, at midnight.',
        body: 'Sales, tips, comps, and deposits reconciled at the end of a fourteen-hour day is where errors are born.',
      },
    ],
    mock: {
      hours: '8.6 hrs',
      rows: [
        { label: 'Invoice capture → food cost', meta: '18 invoices read · cost updated' },
        { label: 'Order builder from pars', meta: 'Tomorrow’s order drafted' },
        { label: 'Daily close reconciliation', meta: 'Ran 3:00a · no exceptions' },
      ],
    },
    situations: [
      'Invoices pile up unentered',
      'Ordering lives in one head',
      'The daily close is a grind',
      'Something else',
    ],
  },
  {
    slug: 'boats',
    aliases: ['marine', 'marina'],
    name: 'Marine & boating',
    headline: 'Work orders, slips, and seasonal contracts that keep themselves straight.',
    lede:
      'Marinas, dealers, charters, and repair yards run a seasonal business with year-round paperwork: slip agreements, service tickets, parts, and haul-out schedules. I build systems that keep it straight so the season stays about the water.',
    pains: [
      {
        title: 'Service work orders scattered across paper and whiteboards.',
        body: 'What’s promised, what’s parts-blocked, and what’s ready for pickup lives in three places and one person’s memory.',
      },
      {
        title: 'Slip and storage agreements renewed by hand.',
        body: 'Contracts, insurance certificates, and rate changes chased one owner at a time, every season.',
      },
      {
        title: 'Parts and special orders nobody can see the status of.',
        body: 'The customer calls, the tech shrugs, and someone digs through emails to find out where the part is.',
      },
    ],
    mock: {
      hours: '7.8 hrs',
      rows: [
        { label: 'Work-order board & pickup alerts', meta: '11 open · 3 ready · owners notified' },
        { label: 'Slip renewal & COI chase', meta: '9 renewals out · 6 signed' },
        { label: 'Parts status tracker', meta: '4 on order · ETAs synced' },
      ],
    },
    situations: [
      'Work orders live on whiteboards',
      'Renewals are a seasonal scramble',
      'Parts status is a mystery',
      'Something else',
    ],
  },
  {
    slug: 'shop',
    aliases: ['retail'],
    name: 'Retail',
    headline: 'Inventory that counts itself before the season turns.',
    lede:
      'Independent retail in a tourism economy means two businesses a year: the season and the off-season. Buying, counts, and the online-versus-floor sync are where the margin leaks. I build systems that stop the leak.',
    pains: [
      {
        title: 'Inventory counts that are always slightly wrong.',
        body: 'The floor, the stockroom, and the website disagree, so you oversell online or over-order for the shelf.',
      },
      {
        title: 'Purchase orders built from gut feel.',
        body: 'Reordering for a season that hasn’t started yet, from last year’s memory, ties up cash in the wrong products.',
      },
      {
        title: 'The daily numbers reconciled by hand.',
        body: 'Register, processor, and bank all say something slightly different, and finding out why eats the morning.',
      },
    ],
    mock: {
      hours: '6.9 hrs',
      rows: [
        { label: 'Floor ↔ online inventory sync', meta: 'Synced hourly · 0 oversells' },
        { label: 'Reorder drafts from sell-through', meta: '2 POs drafted for review' },
        { label: 'Daily sales reconciliation', meta: 'Ran 5:00a · 1 exception flagged' },
      ],
    },
    situations: [
      'Counts never match',
      'Ordering is gut feel',
      'Daily numbers don’t tie out',
      'Something else',
    ],
  },
  {
    slug: 'mfg',
    aliases: ['manufacturing'],
    name: 'Manufacturing',
    headline: 'Quotes, travelers, and certs without the paper chase.',
    lede:
      'Small job shops win on response time and lose on paperwork: quoting, job travelers, purchasing, and the compliance trail. I’ve built a full operations platform for a precision parts shop — quoting to cash, paper gone.',
    pains: [
      {
        title: 'Quotes that take days while the RFQ goes stale.',
        body: 'Material, setup, and run time priced from old jobs and memory. The shop that answers in hours wins the work.',
      },
      {
        title: 'Job travelers and specs on paper, walking the floor.',
        body: 'The router gets marked up, photocopied, and lost. Nobody can say where a job is without walking out to find it.',
      },
      {
        title: 'Certs, POs, and invoices matched by hand.',
        body: 'Getting paid means the paperwork trail is perfect: PO to packing slip to cert to invoice. One mismatch and payment waits.',
      },
    ],
    mock: {
      hours: '13.5 hrs',
      rows: [
        { label: 'Quote drafts from RFQ intake', meta: '4 RFQs in · 3 quotes ready' },
        { label: 'Live job tracking', meta: '17 jobs on floor · statuses current' },
        { label: 'PO ↔ invoice reconciliation', meta: 'Ran 6:00a · all matched' },
      ],
    },
    situations: [
      'Quotes go out too slow',
      'Job status lives on the floor',
      'Payment paperwork is a chase',
      'Something else',
    ],
  },
  {
    slug: 'books',
    aliases: ['cpa', 'accounting'],
    name: 'Accounting & bookkeeping',
    headline: 'You keep everyone’s books. The document chase shouldn’t keep you.',
    lede:
      'Small firms and solo bookkeepers lose their month to chasing client documents, keying source docs, and tracking who’s waiting on what. I build systems that do the chasing and the keying — and for the clients whose operations are the real mess, I’m the implementer you can refer with confidence.',
    pains: [
      {
        title: 'Chasing clients for documents, every single month.',
        body: 'Statements, receipts, and payroll reports arrive late, by email, in every format. The chase is the job before the job.',
      },
      {
        title: 'Source documents keyed in by hand.',
        body: 'Reading PDFs and typing numbers into the ledger is hours of work a machine should be doing, with fewer errors.',
      },
      {
        title: 'Client status tracked in your head.',
        body: 'Forty clients, each mid-something. Which returns are waiting on you versus them shouldn’t require an audit of your inbox.',
      },
    ],
    mock: {
      hours: '10.8 hrs',
      rows: [
        { label: 'Client document chase & intake', meta: '28 requested · 21 received' },
        { label: 'Source-doc extraction', meta: '143 transactions keyed for review' },
        { label: 'Client status board', meta: '9 waiting on client · 3 on you' },
      ],
    },
    situations: [
      'Document chasing eats the month',
      'Data entry by hand',
      'Client status lives in my head',
      'A client of mine needs this',
    ],
  },
  {
    slug: 'firms',
    aliases: ['pros'],
    name: 'Professional services',
    headline: 'Intake, documents, and status updates shouldn’t consume the hours you sell.',
    lede:
      'Law offices, insurance agencies, architects, engineers: the product is expertise, but the day goes to intake forms, document assembly, and clients calling to ask where things stand. I build systems that give the hours back to the work that bills.',
    pains: [
      {
        title: 'Intake that starts every matter with retyping.',
        body: 'The client fills out a form, and someone keys it into the system, the engagement letter, and the file. Same data, three times.',
      },
      {
        title: 'Documents assembled by copy-paste from the last one.',
        body: 'Standard letters, agreements, and filings built by editing an old client’s version — with the old client’s name waiting to be missed.',
      },
      {
        title: '“Just checking in” calls that interrupt the billable day.',
        body: 'Clients call because they can’t see status. Every call is five minutes of reassurance that a system could have delivered automatically.',
      },
    ],
    mock: {
      hours: '8.2 hrs',
      rows: [
        { label: 'Intake → file → letter automation', meta: '6 new matters opened clean' },
        { label: 'Document assembly', meta: '12 drafts generated for review' },
        { label: 'Client status updates', meta: '34 sent · 0 check-in calls today' },
      ],
    },
    situations: [
      'Intake means retyping',
      'Documents built by copy-paste',
      'Status calls eat the day',
      'Something else',
    ],
  },
]

/** The generic no-industry version — where the 404 net and untargeted visitors land. */
export const PULSE_CHECK: LandingIndustry = {
  slug: 'customer-pulse-check',
  aliases: [],
  name: 'Small business',
  headline: 'A pulse check on how your business actually runs.',
  lede:
    'Every business has a handful of tasks quietly eating its week: the report built by hand, the paperwork typed twice, the follow-up that depends on memory. The first conversation is free, and it starts with me listening to how your operation actually works.',
  pains: [
    {
      title: 'The report that takes hours to pull together.',
      body: 'Data gathered from multiple systems, combined in a spreadsheet, checked by eye — every week or every month, forever.',
    },
    {
      title: 'The paperwork that gets typed twice.',
      body: 'A customer or a form writes it down; someone in the office types it in again. Every retype is a chance to be wrong.',
    },
    {
      title: 'The follow-up that depends on someone remembering.',
      body: 'Renewals, callbacks, invoices, reminders. Memory is not a system, and the misses cost real money.',
    },
  ],
  mock: {
    hours: '9.5 hrs',
    rows: [
      { label: 'The weekly report', meta: 'Ran 6:00a · in your inbox' },
      { label: 'Form intake → your system', meta: '17 entries · 0 retyped' },
      { label: 'Follow-up reminders', meta: '12 sent · nothing forgotten' },
    ],
  },
  situations: [
    'A report eats hours every week',
    'Paperwork gets typed twice',
    'Follow-up slips through',
    'Something else',
  ],
}

const bySlug = new Map(LANDING_INDUSTRIES.map((i) => [i.slug, i]))
const aliasToSlug = new Map(LANDING_INDUSTRIES.flatMap((i) => i.aliases.map((a) => [a, i.slug] as const)))

export function findLanding(word: string): { entry: LandingIndustry; canonical: boolean } | null {
  const w = word.toLowerCase()
  const direct = bySlug.get(w)
  if (direct) return { entry: direct, canonical: true }
  const via = aliasToSlug.get(w)
  if (via) return { entry: bySlug.get(via)!, canonical: false }
  return null
}
