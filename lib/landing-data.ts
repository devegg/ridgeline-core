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
  /** The sample portal dashboard mock. `since` is the cumulative line
      (the relationship compounds); `caught` is the caught-and-fixed log
      (things break, the system catches them — the honesty proof); `next`
      is one in-progress item (the request→shipped loop, in miniature). */
  mock: {
    hours: string
    since: string
    rows: { label: string; meta: string }[]
    caught: { when: string; what: string }[]
    next: string
  }
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
      since: '~148 hrs · ~$6,400 since we started',
      rows: [
        { label: 'Owner statement prep & reconciliation', meta: '43 drafts ready for licensed review' },
        { label: 'Turnover board sync', meta: 'Saturday: 14 turns, all assigned' },
        { label: 'Guest message triage', meta: '31 routine handled · 2 flagged to you' },
      ],
      caught: [
        { when: 'Jul 8', what: 'Caught 3 reservations that didn’t copy to the books and re-sent them.' },
        { when: 'Jun 25', what: 'Held a payout that didn’t match its statement for a human look.' },
      ],
      next: 'Weekly owner-payout summary email',
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
      since: '~121 hrs · ~$5,200 since we started',
      rows: [
        { label: 'Work-order intake & dispatch', meta: '12 open · status texts sent · audit trail kept' },
        { label: 'Owner statement assembly', meta: 'Drafts ready for your review' },
        { label: 'Dues reminder sequence', meta: '17 sent · 2 escalations flagged to you' },
      ],
      caught: [
        { when: 'Jul 2', what: 'Flagged a vendor bill that looked like a duplicate before it was paid twice.' },
        { when: 'Jun 14', what: 'Caught a bill coded to the wrong property and corrected it.' },
      ],
      next: 'Owner statements emailed on the 1st, automatically',
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
      since: '~104 hrs · ~$4,700 since we started',
      rows: [
        { label: 'Contract-to-close checklists', meta: '7 active files · deadlines auto-calculated' },
        { label: 'Lead acknowledgment & routing', meta: 'Sat 9:14p inquiry · answered in 90 seconds' },
        { label: 'Commission & CDA prep', meta: 'Draft ready for broker sign-off' },
      ],
      caught: [
        { when: 'Jul 6', what: 'Flagged a file missing its inspection deadline the day the contract landed.' },
        { when: 'Jun 20', what: 'Caught a Saturday-night lead sitting unanswered and paged the on-call agent.' },
      ],
      next: 'Closing checklist built straight from the contract',
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
      since: '~117 hrs · ~$5,600 since we started',
      rows: [
        { label: 'Draw package assembly', meta: 'SOV + waivers + photos · 1 missing waiver flagged' },
        { label: 'Field-to-books job costing', meta: 'Live across 5 jobs · one trending over' },
        { label: 'Punch-list routing', meta: '9 items by trade · 3 closed today' },
      ],
      caught: [
        { when: 'Jul 3', what: 'Flagged a draw package missing one sub’s lien waiver before it went out.' },
        { when: 'Jun 11', what: 'Caught receipts posted to the wrong job and re-coded them.' },
      ],
      next: 'Pay-app roll-forward from last month’s schedule of values',
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
    aliases: ['hvac', 'pest', 'pools', 'lawn'],
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
      since: '~139 hrs · ~$6,100 since we started',
      rows: [
        { label: 'Job close → same-day invoice', meta: '9 sent today · extras captured at the truck' },
        { label: 'Agreement renewals & card checks', meta: '17 due · 3 expired cards caught' },
        { label: 'Appointment confirmations', meta: '31 confirmed · 1 reschedule caught early' },
      ],
      caught: [
        { when: 'Jul 7', what: 'Caught an unbilled after-hours call and added it to the invoice.' },
        { when: 'Jun 19', what: 'Flagged an expiring card before the maintenance plan lapsed.' },
      ],
      next: 'Same-day review requests after job close',
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
    slug: 'plumbing',
    aliases: ['plumber'],
    name: 'Plumbing',
    headline: 'You’re a plumber, not a paper-pusher. The invoices shouldn’t wait for Sunday night.',
    lede:
      'Summer on the coast means the phone rings all day — service calls, rental turnovers, water heaters that picked July to quit — and a share of those calls ring out to the guy down the road while your dispatcher rebuilds the morning. Meanwhile the money sits in the truck and the maintenance agreements quietly lapse. I build systems that carry the office side, so the wrench work is the whole job.',
    pains: [
      {
        title: 'The schedule blows up by 8 a.m.',
        body: 'One emergency call and the dispatcher spends the morning on the phone rebuilding the whole board — while new calls ring out and land with whoever answers first.',
      },
      {
        title: 'Money sits in the truck.',
        body: 'The job wraps Monday, the paperwork rides around all week, and the invoice goes out Sunday night — then you’re chasing the check. Work you already did, cash you’re still waiting on.',
      },
      {
        title: 'A shoebox of signed maintenance agreements, and no idea whose card just bounced.',
        body: 'The steadiest revenue you have: inspections nobody books, renewals nobody tracks, cards that quietly expired. It cancels itself while everyone’s under a house.',
      },
      {
        title: 'Your reviews are stale, and the competition’s aren’t.',
        body: 'Every happy customer is a five-star review you never asked for, because asking is one more manual step at the end of a long day.',
      },
    ],
    mock: {
      hours: '11.8 hrs',
      since: '~132 hrs · ~$5,900 since we started',
      rows: [
        { label: 'Job close → same-day invoice', meta: '8 sent today · extras captured at the truck' },
        { label: 'Agreement renewals & card checks', meta: '12 due · 2 expired cards caught' },
        { label: 'Review request after job close', meta: '6 asked · 2 new five-stars' },
      ],
      caught: [
        { when: 'Jul 9', what: 'Caught a finished job that never became an invoice; billed it same day.' },
        { when: 'Jun 21', what: 'Flagged an expired card before the maintenance plan quietly lapsed.' },
      ],
      next: 'Missed-call text-back, so voicemail stops losing jobs',
    },
    situations: [
      'The schedule blows up by 8 a.m.',
      'Money sits in the truck',
      'Maintenance plans quietly lapse',
      'Reviews are stale',
      'Something else',
    ],
  },
  {
    slug: 'med',
    aliases: ['dental'],
    name: 'Medical & dental',
    headline: 'Your front desk shouldn’t spend half its day on hold with insurance.',
    lede:
      'Independent practices lose clinical time to clerical work: eligibility checked payer by payer, denials reworked by hand, a recall list nobody has time to call, and intake typed twice. I build systems that give the front desk its day back — patient data handled carefully, compliance first, and a person reviewing anything that touches the chart or a claim.',
    pains: [
      {
        title: 'Insurance verified over and over — and the denial still surprises you.',
        body: 'Payer portals, hold music, benefits rechecked before every visit. Then January resets the deductibles, the snowbirds arrive with plans your desk has never seen, and the coverage gap surfaces after the claim instead of before the visit.',
      },
      {
        title: 'Denials are money you already earned, walking away.',
        body: 'Most start as small front-end errors — a field, a code, a stale eligibility check — and reworking them means chart-pulling and payer calls. The ones nobody has time to rework become permanent losses.',
      },
      {
        title: 'The recall list just sits there. Nobody has time to call.',
        body: 'Empty chair time is the most expensive time in the building. Patients who leave unscheduled mostly don’t come back on their own, and the no-show on a rainy Monday goes unfilled.',
      },
      {
        title: 'Patients write it on a clipboard. Staff type it in again.',
        body: 'Every retype is a chance for an error in a record that matters — and registration errors are where a surprising share of denials begin.',
      },
    ],
    mock: {
      hours: '9.3 hrs',
      since: '~112 hrs · ~$5,000 since we started',
      rows: [
        { label: 'Eligibility pre-check', meta: 'Tomorrow verified · 2 coverage gaps flagged' },
        { label: 'Recall & no-show outreach', meta: '31 reminders sent · 5 rebooked' },
        { label: 'Digital intake → chart', meta: '22 patients · 0 retyped forms' },
      ],
      caught: [
        { when: 'Jul 9', what: 'Caught a coverage gap the night before the visit, not after the claim.' },
        { when: 'Jun 26', what: 'Flagged a claim missing a code before it went out the door.' },
      ],
      next: 'Recall outreach for overdue hygiene patients',
    },
    situations: [
      'Verification eats the morning',
      'Denials keep coming back',
      'Recalls and no-shows slip',
      'Paper forms typed twice',
      'Something else',
    ],
  },
  {
    slug: 'food',
    aliases: ['dine'],
    name: 'Hospitality & restaurants',
    headline: 'Your POS, your books, and your bank should already agree by the time you get home.',
    lede:
      'On a restaurant margin, the hours lost to paperwork and the errors that slip through aren’t an annoyance — they’re the difference between a good season and a scary winter. The schedule, the invoice pile, the daily numbers, the tax forms: I make them run themselves, so July doesn’t break what January merely bent.',
    pains: [
      {
        title: 'The schedule eats a workday — then two people call out Friday.',
        body: 'Built in a spreadsheet, confirmed by text, rebuilt every time someone drops a shift. In peak season the callout scramble lands mid-rush, and the manager works the group chat instead of the floor.',
      },
      {
        title: 'Invoices pile up in a shoebox until the vendor calls.',
        body: 'Food, beverage, and linen invoices keyed in line by line, or not at all — so food cost is a guess until the accountant says otherwise, weeks later, and the price creep on your top items goes unnoticed.',
      },
      {
        title: 'Yesterday’s sales, re-typed every morning.',
        body: 'The Z-report keyed into the books by hand, then the deposit that’s supposed to match it doesn’t, and someone spends the morning finding out why. Errors born at midnight get found at tax time.',
      },
      {
        title: 'Three tax forms, all due the 20th, every month.',
        body: 'State sales tax, accommodations tax, local hospitality tax — separate forms, separate offices, steep penalties, and the biggest remittances land exactly when you’re busiest.',
      },
    ],
    mock: {
      hours: '8.6 hrs',
      since: '~98 hrs · ~$4,300 since we started',
      rows: [
        { label: 'POS → books nightly sync', meta: 'Ran 3:00a · deposit matched' },
        { label: 'Invoice capture → food cost', meta: '18 invoices read · price creep flagged' },
        { label: 'Schedule draft from sales pattern', meta: 'Next week drafted · 2 gaps flagged' },
      ],
      caught: [
        { when: 'Jul 5', what: 'Caught a vendor price jump on your top item, inside the invoice.' },
        { when: 'Jun 17', what: 'Flagged a deposit that didn’t match Tuesday’s close.' },
      ],
      next: 'Schedule draft from last July’s sales pattern',
    },
    situations: [
      'The schedule eats a workday',
      'Invoices pile up unentered',
      'Sales re-keyed, deposits off',
      'Tax filings every 20th',
      'Something else',
    ],
  },
  {
    slug: 'boats',
    aliases: ['marine', 'marina'],
    name: 'Marine & boating',
    headline: 'Your crew is great with a wrench. The paperwork is what’s killing the season.',
    lede:
      'Marinas, dealers, charters, and repair yards get one compressed season to make the year — and every week of it run on paper and memory is missed billings, late invoices, and slips that should have renewed but didn’t. I build systems that keep it straight, from spring splash to hurricane haul-out.',
    pains: [
      {
        title: 'Every spring, the same renewal fire drill.',
        body: 'The slip and storage spreadsheet rebuilt again, contracts chased one owner at a time, nobody sure who signed and who paid. A slip that sits empty in June is revenue you can’t get back.',
      },
      {
        title: 'The work order’s on the bench, the parts are on a sticky note.',
        body: 'Commissioning and winterization compress hundreds of jobs into a few weeks, techs report status verbally, and the invoice goes out two weeks after the boat left. Billable hours quietly go missing.',
      },
      {
        title: 'The same slip booked twice on a Saturday morning.',
        body: 'Phone, email, walk-up, and radio all take reservations, and the calendar is whoever wrote it down. Sorting a double-booking out on the dock in July is how a good customer becomes a former one.',
      },
      {
        title: 'Everything gets entered twice — and still doesn’t match.',
        body: 'Once in the marina or booking system, once in QuickBooks, and month-end becomes a hunt for which one is right. Slip, fuel, service, and retail billing pulled from four places by hand.',
      },
    ],
    mock: {
      hours: '7.8 hrs',
      since: '~89 hrs · ~$4,000 since we started',
      rows: [
        { label: 'Slip renewal & billing run', meta: '9 renewals out · 6 signed · 2 nudged' },
        { label: 'Work order → same-day invoice', meta: '11 open · 3 billed at pickup' },
        { label: 'Ops ↔ QuickBooks sync', meta: 'Month-end tied out · 0 mismatches' },
      ],
      caught: [
        { when: 'Jul 1', what: 'Flagged a slip renewal still unsigned two weeks before season.' },
        { when: 'Jun 9', what: 'Caught a work order finished but never billed.' },
      ],
      next: 'Haul-out priority list wired to the storm watch',
    },
    situations: [
      'Spring renewals are a fire drill',
      'Work orders on sticky notes',
      'Double-booked on a Saturday',
      'Everything entered twice',
      'Something else',
    ],
  },
  {
    slug: 'shop',
    aliases: ['retail'],
    name: 'Retail',
    headline: 'Sunday night shouldn’t be for figuring out why the bank doesn’t match the register.',
    lede:
      'Independent retail in a tourism economy is two businesses a year: a summer that nearly kills you with volume and a winter that nearly kills you with bills. The re-keying, the oversells, and the filings cost you most exactly when you have the least time to fix them. I build systems that close the gap.',
    pains: [
      {
        title: 'The register already knows. QuickBooks gets told by hand.',
        body: 'Sales re-keyed night after night, card deposits landing as one net number that bundles fees and refunds — so the bank never matches the books without hand-tracing the gap.',
      },
      {
        title: 'The shelf and the website disagree, in July.',
        body: 'The last one sells at the counter while it sells online, and now you’re writing a “sorry, we’re out” email to the exact customer you waited all winter for.',
      },
      {
        title: 'Buying lives in spreadsheets, email threads, and your head.',
        body: 'Winter buying decides the summer: a July stockout of a bestseller is lost forever, and the overbuy sits on the shelf eating cash until May. Receiving against the vendor invoice happens line by line, when it happens.',
      },
      {
        title: 'The drawer count, the monthly filing, and the tax-free weekend — one desk.',
        body: 'Seasonal cashiers and multiple shifts multiply the little variances, the sales-tax return is due the 20th, and August’s return has its own special rules. All of it lands on whoever’s already busiest.',
      },
    ],
    mock: {
      hours: '6.9 hrs',
      since: '~76 hrs · ~$3,300 since we started',
      rows: [
        { label: 'POS → books nightly', meta: 'Ran 11:30p · deposit matched' },
        { label: 'Counter ↔ online inventory', meta: 'Synced hourly · 0 oversells' },
        { label: 'Reorder drafts from sell-through', meta: '2 POs ready for review' },
      ],
      caught: [
        { when: 'Jul 4', what: 'Caught an online oversell before the order confirmed.' },
        { when: 'Jun 22', what: 'Traced a drawer variance to one shift on one register.' },
      ],
      next: 'Reorder drafts from this week’s sell-through',
    },
    situations: [
      'Bank never matches the register',
      'Oversold online again',
      'Buying lives in my head',
      'Filings and drawer counts pile up',
      'Something else',
    ],
  },
  {
    slug: 'mfg',
    aliases: ['manufacturing'],
    name: 'Manufacturing',
    headline: 'You’re the best estimator in the building. So why are you quoting at 9 p.m.?',
    lede:
      'Small job shops win on response time and lose on paperwork. Buyers expect a number inside a day now, most quotes don’t win, and the paperwork that gets you paid — travelers, certs, the PO-to-invoice match — is all built by hand. I’ve built a full operations platform for a precision parts shop: quoting to cash, paper gone.',
    pains: [
      {
        title: 'Your most experienced person prices every quote — and most don’t win.',
        body: 'A plan set, a highlighter, and a spreadsheet, at night, after running the shop all day. Roughly one in three quotes lands, so most of that skilled time is spent on jobs that go to someone else — and the buyer who waited three days already moved on.',
      },
      {
        title: 'The traveler is still on paper, walking the floor.',
        body: 'The router gets marked up, photocopied, split with the job, and lost. Nobody can say where a job is without walking out to find it, and the answer changes by the hour.',
      },
      {
        title: 'Certs assembled by hand on shipment day.',
        body: 'Material certs, certs of conformance, first-article reports — pulled from a pile of PDFs while the truck waits. Your aerospace and defense customers don’t accept “it’s here somewhere.”',
      },
      {
        title: 'POs, packing slips, and invoices matched line by line.',
        body: 'Getting paid means the trail is perfect, so overpayments and missed discounts slip through and month-end drags. The same job gets re-typed into four different screens along the way.',
      },
    ],
    mock: {
      hours: '13.5 hrs',
      since: '~162 hrs · ~$7,400 since we started',
      rows: [
        { label: 'Quote drafts from RFQ intake', meta: '4 RFQs in · 3 drafts ready for pricing' },
        { label: 'Live job tracking', meta: '17 jobs on floor · statuses current' },
        { label: 'Cert package assembly', meta: 'Ship-ready in minutes · full trail' },
      ],
      caught: [
        { when: 'Jul 8', what: 'Flagged a PO-to-invoice mismatch before it stalled payment.' },
        { when: 'Jun 24', what: 'Caught a cert missing from tomorrow’s shipment package.' },
      ],
      next: 'Quote drafts straight from incoming RFQ emails',
    },
    situations: [
      'Quoting eats my nights',
      'Job status lives on the floor',
      'Cert packages are a scramble',
      'Same job typed into four screens',
      'Something else',
    ],
  },
  {
    slug: 'books',
    aliases: ['cpa', 'accounting'],
    name: 'Accounting & bookkeeping',
    headline: 'You keep everyone’s books. The document chase shouldn’t keep you.',
    lede:
      'Every hour spent begging for bank statements and re-keying PDFs is an hour you can’t bill — and it’s the reason you keep saying “I can’t take another client right now.” I build systems that do the chasing, the keying, and the status-tracking. And for the clients whose operations are the real mess, I’m the implementer you can refer with confidence.',
    pains: [
      {
        title: 'Half the day is “just circling back” emails.',
        body: 'Statements, receipts, and W-9s arrive late, by email, in every format — and the chase is the job before the job. By the time everybody finally sends their stuff, you’re already behind, and it’s the 18th.',
      },
      {
        title: 'Re-typing transactions a computer could read in seconds.',
        body: 'PDF bank statements keyed line by line, uncategorized transactions coded by hand, months of catch-up discovered the day a close is due.',
      },
      {
        title: 'Which clients are done, stuck, or waiting lives in your head.',
        body: 'A spreadsheet and memory work at fifteen clients and quietly fail past thirty. When someone asks “where are we on their books,” the answer shouldn’t require an inbox excavation.',
      },
      {
        title: 'The 20th sneaks up on a different client every month.',
        body: 'Sales tax, accommodations tax, hospitality tax — coastal tourism clients each with their own forms, jurisdictions, and penalty clocks, all landing while the regular closes are still open.',
      },
    ],
    mock: {
      hours: '10.8 hrs',
      since: '~127 hrs · ~$5,700 since we started',
      rows: [
        { label: 'Document chase & intake', meta: '28 requested · 21 in · 7 auto-nudged' },
        { label: 'Statement extraction', meta: '143 transactions coded for your review' },
        { label: 'Client status board', meta: '9 waiting on client · 3 on you' },
      ],
      caught: [
        { when: 'Jul 10', what: 'Caught a client’s missing statement five days before the 20th.' },
        { when: 'Jun 27', what: 'Flagged 14 uncategorized transactions before the close.' },
      ],
      next: 'Auto-nudge for missing client documents',
    },
    situations: [
      'Half my day is circling back',
      'Re-typing PDF statements',
      'Client status lives in my head',
      'The 20th keeps sneaking up',
      'A client of mine needs this',
    ],
  },
  {
    slug: 'firms',
    aliases: ['pros'],
    name: 'Professional services',
    headline: 'You sell hours. The paperwork shouldn’t be eating them off the invoice.',
    lede:
      'Law offices, insurance agencies, architects, engineers: the product is expertise, but the day goes to reconstructing time from memory, re-keying intake, assembling documents from the last client’s version, and answering “what’s happening with my file?” Every month, a slice of billable work never makes it onto an invoice — and you never get that money back.',
    pains: [
      {
        title: 'Time gets written down at the end of the week, from memory.',
        body: 'The sixth phone call of the day never makes the timesheet. Log time tomorrow and a slice is gone; log it Friday and more is — work you did, hours you sold, money that never gets billed.',
      },
      {
        title: 'Intake starts every matter with retyping.',
        body: 'The client fills out a form; someone keys it into the system, the conflicts check, the engagement letter, and the file. Same data, four times, and the prospect is waiting the whole while.',
      },
      {
        title: 'Documents assembled by editing the last client’s version.',
        body: 'Standard letters, agreements, filings, and certificates built by copy-paste — with the old client’s name sitting in paragraph four, waiting to be missed on a deadline day.',
      },
      {
        title: '“What’s happening with my file?” — five times a day.',
        body: 'Clients call because they can’t see status, and someone drops billable work to go find out. Reassurance a system could deliver automatically, before they had to ask.',
      },
    ],
    mock: {
      hours: '8.2 hrs',
      since: '~95 hrs · ~$4,500 since we started',
      rows: [
        { label: 'Time capture from calendar & email', meta: 'Draft entries ready for review' },
        { label: 'Intake → conflicts → letter', meta: '6 matters opened clean' },
        { label: 'Client status updates', meta: '34 sent · 0 check-in calls today' },
      ],
      caught: [
        { when: 'Jul 7', what: 'Caught six calendar entries that never became time entries.' },
        { when: 'Jun 30', what: 'Flagged an old client’s name in a new document draft.' },
      ],
      next: 'Status updates that send before clients ask',
    },
    situations: [
      'Hours leak before billing',
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
    since: '~110 hrs · ~$4,900 since we started',
    rows: [
      { label: 'The weekly report', meta: 'Ran 6:00a · in your inbox' },
      { label: 'Form intake → your system', meta: '17 entries · 0 retyped' },
      { label: 'Follow-up reminders', meta: '12 sent · nothing forgotten' },
    ],
    caught: [
      { when: 'Jul 8', what: 'Flagged a bill that looked like a duplicate before it was paid twice.' },
      { when: 'Jun 25', what: 'Caught a form entry that didn’t copy over and re-sent it.' },
    ],
    next: 'The weekly report, without the copy-paste',
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
