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
      'Peak season on the Grand Strand runs on heroics: turnover boards, guest messages at midnight, and owner payouts reconciled by hand. I build systems that carry that load automatically, so the season runs on rails instead of adrenaline.',
    pains: [
      {
        title: 'Owner statements and payouts, reconciled by hand.',
        body: 'Every month, someone lines up bookings, fees, and expenses across systems and prays the numbers match before the statements go out. One mistake and an owner is on the phone.',
      },
      {
        title: 'Turnover scheduling held together by texts.',
        body: 'Checkout at ten, check-in at four, and a housekeeping board that lives in group texts and memory. One missed turn is a ruined arrival and a review you keep forever.',
      },
      {
        title: 'Guest messages answered one at a time, around the clock.',
        body: 'The same twenty questions, every week, across platforms. The urgent one is buried under nineteen routine ones.',
      },
      {
        title: 'Owners asking questions the data should answer.',
        body: '“How did my unit do last month?” shouldn’t require an afternoon of spreadsheet archaeology to answer well.',
      },
    ],
    mock: {
      hours: '11.4 hrs',
      rows: [
        { label: 'Owner statement reconciliation', meta: 'Ran 6:02a · 43 statements matched' },
        { label: 'Turnover board sync', meta: '14 turns scheduled this week' },
        { label: 'Guest message triage', meta: '31 routine handled · 2 flagged to you' },
      ],
    },
    situations: [
      'Owner statements take days',
      'Turnovers run on texts and memory',
      'Guest messages never stop',
      'Something else',
    ],
  },
  {
    slug: 'pm',
    aliases: ['property'],
    name: 'Property management',
    headline: 'Work orders, rent, and owner reports that move without you pushing.',
    lede:
      'Long-term and HOA management is follow-up work: tenants, vendors, owners, and boards all waiting on somebody to push the next thing. I build the systems that do the pushing.',
    pains: [
      {
        title: 'Work orders that stall between tenant, vendor, and office.',
        body: 'A repair request comes in by phone, gets written on something, waits for a vendor callback, and nobody can say where it stands without three calls.',
      },
      {
        title: 'Rent, late fees, and ledgers touched by hand.',
        body: 'Chasing payments and posting them across systems eats the first week of every month, and mistakes land in owner statements.',
      },
      {
        title: 'Owner and board reporting assembled from scratch.',
        body: 'The monthly package means pulling from the ledger, the maintenance log, and the bank, then formatting it for people who will ask questions either way.',
      },
    ],
    mock: {
      hours: '9.7 hrs',
      rows: [
        { label: 'Work-order dispatch & status', meta: '12 open · vendors auto-nudged' },
        { label: 'Rent posting & late-fee run', meta: 'Ran 12:00a · 3 exceptions flagged' },
        { label: 'Owner report assembly', meta: 'Drafts ready for review' },
      ],
    },
    situations: [
      'Work orders fall through cracks',
      'Rent and ledgers eat the first week',
      'Owner reports take too long',
      'Something else',
    ],
  },
  {
    slug: 'real',
    aliases: ['realty'],
    name: 'Real estate',
    headline: 'The deal moves fast. The paperwork shouldn’t slow it down.',
    lede:
      'Brokerages and agent teams live on transaction paperwork, follow-up, and an inbox that never empties. I’ve built for brokers before: the system keeps the deal moving so the people can sell.',
    pains: [
      {
        title: 'Transaction paperwork re-keyed at every stage.',
        body: 'The same names, dates, and numbers typed into the contract, the checklist, the CRM, and the email chain. Every re-key is a chance to be wrong.',
      },
      {
        title: 'Follow-up that depends on someone remembering.',
        body: 'Leads, past clients, and pending deadlines all need a touch at the right moment. Memory is not a system, and dropped follow-up is dropped commission.',
      },
      {
        title: 'An inbox that buries the deal-critical message.',
        body: 'Offers, amendments, and closing documents arrive mixed in with everything else. The one that mattered gets found late.',
      },
    ],
    mock: {
      hours: '8.9 hrs',
      rows: [
        { label: 'Transaction checklist sync', meta: '7 active files · 0 missing docs' },
        { label: 'Follow-up scheduler', meta: '23 touches queued this week' },
        { label: 'Inbox triage', meta: 'Deal mail flagged · noise filtered' },
      ],
    },
    situations: [
      'Paperwork re-keyed at every stage',
      'Follow-up depends on memory',
      'The inbox buries what matters',
      'Something else',
    ],
  },
  {
    slug: 'trades',
    aliases: ['construction'],
    name: 'Construction & trades',
    headline: 'You bid it and you build it. The office in between shouldn’t cost your evenings.',
    lede:
      'Estimates, job costing, draws, subs, and punch lists: the jobsite runs all day and the paperwork waits for night. I build systems that handle the office side while you’re on the site side.',
    pains: [
      {
        title: 'Estimates and bids built from scratch every time.',
        body: 'Takeoffs and pricing live in old spreadsheets and your head. Slow quotes lose work to whoever answered first.',
      },
      {
        title: 'Job costs that show up after the job is done.',
        body: 'Receipts, sub invoices, and change orders trickle in, so you learn what a job actually made weeks too late to fix it.',
      },
      {
        title: 'Draws, pay apps, and lien waivers chased by hand.',
        body: 'Getting paid means paperwork in the right order at the right time, and chasing it steals the hours that win the next job.',
      },
    ],
    mock: {
      hours: '10.2 hrs',
      rows: [
        { label: 'Quote builder from takeoff sheet', meta: '3 estimates drafted for review' },
        { label: 'Job-cost roll-up', meta: 'Live across 5 active jobs' },
        { label: 'Draw & waiver tracker', meta: '2 pay apps ready · 1 waiting on sub' },
      ],
    },
    situations: [
      'Quotes take too long to get out',
      'Job costs arrive too late',
      'Draws and waivers are a chase',
      'Something else',
    ],
  },
  {
    slug: 'home',
    aliases: ['hvac'],
    name: 'HVAC & home services',
    headline: 'Your techs are in the field. The office shouldn’t need three more of you.',
    lede:
      'Dispatch, service agreements, invoicing from the truck, and the review follow-up nobody has time for. I build the systems that keep the calls flowing and the cash coming in without another office hire.',
    pains: [
      {
        title: 'Dispatch and scheduling juggled by one overloaded person.',
        body: 'Calls come in, techs are mid-job, and the board changes hourly. When the scheduler is out sick, the whole day wobbles.',
      },
      {
        title: 'Invoices that wait until the truck gets back.',
        body: 'Work finished Tuesday gets billed Friday, paid whenever. The gap between job-done and money-in is pure float you’re giving away.',
      },
      {
        title: 'Service agreements that renew on memory.',
        body: 'Maintenance plans are the steadiest revenue you have, and renewals slip because reminding customers is a manual job.',
      },
    ],
    mock: {
      hours: '12.1 hrs',
      rows: [
        { label: 'Same-day invoice from job close', meta: '9 sent today · avg 2h after job' },
        { label: 'Agreement renewal reminders', meta: '17 due this month · all queued' },
        { label: 'Review request follow-up', meta: '6 requests sent · 2 new reviews' },
      ],
    },
    situations: [
      'Dispatch depends on one person',
      'Invoices lag days behind jobs',
      'Renewals slip through',
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
