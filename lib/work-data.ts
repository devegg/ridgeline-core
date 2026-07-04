// Portfolio entries for /work — content-as-code for now (reviewable in git).
// Later: generated from workspace project.yaml manifests per ADR-002.

export type WorkEntry = {
  slug: string
  name: string
  kind: string
  status: string
  oneLiner: string
  body: string[]
  outcome: string
  href?: string
  paperId?: string
  stack: string
}

export const WORK: WorkEntry[] = [
  {
    slug: 'rfq-hunter',
    name: 'RFQ Hunter',
    kind: 'Federal contracting · SaaS',
    status: 'Live in private beta',
    oneLiner: 'A federal-contract intelligence platform for small suppliers bidding on government work.',
    body: [
      'Small suppliers to the Defense Logistics Agency pick through thousands of solicitations by hand, with no view of award history, pricing, or the competition. The data to fix that is public — the government publishes it — but nobody had put it in front of the people who need it at a price they could justify.',
      'RFQ Hunter ingests the government’s own published data and turns it into working intelligence: solicitation matching, award and pricing history, competitor analysis, demand forecasting, and a bid workspace. Built from the ground up as a single codebase — ingestion pipelines, database, and application.',
    ],
    outcome: 'Live in private beta with real users. Four hundred merged pull requests and climbing.',
    href: 'https://www.rfqhunter.com',
    stack: 'Next.js · Supabase · Vercel',
  },
  {
    slug: 'gridstrain',
    name: 'GridStrain',
    kind: 'Data & infrastructure',
    status: 'Live',
    oneLiner: 'Watching the American power grid strain, in near real time.',
    body: [
      'GridStrain tracks stress on the U.S. power grid — regional demand, state-by-state electricity rates, and the gap between what the grid is doing and what it can take.',
      'The pipeline refreshes itself every hour, unattended: ingestion, database, and site, built end-to-end. It has been quietly updating itself since the day it shipped.',
    ],
    outcome: 'Live. The data updates hourly whether anyone is watching or not.',
    href: 'https://gridstrain.com',
    stack: 'Next.js · automated data pipeline · Vercel',
  },
  {
    slug: 'movie-slot-machine',
    name: 'Movie Slot Machine',
    kind: 'Consumer web',
    status: 'Live',
    oneLiner: 'Thirty minutes deciding what to watch. Pull the lever instead.',
    body: [
      'A small, finished thing: set a genre, pull the lever, get a film. Designed, built, and shipped to production.',
      'Not every build has to be an operations platform. Some just have to work, feel good, and be done.',
    ],
    outcome: 'Live. Deciding what to watch now takes eleven seconds.',
    href: 'https://movieslotmachine.com',
    stack: 'Next.js · Vercel',
  },
  {
    slug: 'acme-smart-log',
    name: 'ACME Smart Log — ops platform for a DoD parts supplier',
    kind: 'Client work · Defense manufacturing',
    status: 'Live in production',
    oneLiner: 'A two-person precision-parts operation moved off paper, spreadsheets, and one person’s memory.',
    body: [
      'ACME Manufacturing — a two-person DoD parts supplier — ran its precision-parts operation on handwritten job forms, Excel, and email. Job status lived in one person’s head. Government payment reconciliation was done by hand against 48-column CSV extracts, hours of work every week.',
      'I designed and built ACME Smart Log, a purpose-built operations platform: live job tracking, camera-to-data form intake with AI document reading, automated reconciliation of government payments, inquiry management with deadline alerts, and a complete audit trail.',
    ],
    outcome:
      'In production, in daily use — roughly $2.4M in business data tracked across 419 job orders and ~3,600 payment transactions. One developer, zero shortcuts. ACME Manufacturing is a stage name — the client, the system, and the numbers are real. References available in a serious conversation.',
    stack: 'Next.js · Supabase · Claude Vision OCR · Vercel',
  },
  {
    slug: 'heart-echoes-music',
    name: 'Heart Echoes Music Storefront',
    kind: 'Music commerce',
    status: 'Built, paused — a future side project',
    oneLiner: 'A storefront for a 900-song catalog, engineered to a $26-a-month infrastructure ceiling.',
    body: [
      'Heart Echoes Music is a 900-song AI-assisted catalog that needed a store serving two different buyers from one codebase: fans buying downloads, and producers buying MIDI and stem packs.',
      'The build is an exercise in cost discipline and data-migration rigor: a hybrid Supabase + Cloudflare R2 architecture with a fixed monthly ceiling, an Airtable-to-PostgreSQL migration with source-id anchoring, and human curation rules enforced in the pipeline.',
    ],
    outcome: 'Close to done, and set aside for now to put my time into RFQ Hunter. I will finish it as a side business — the architecture and migration discipline are the story, and the paper walks through both.',
    stack: 'Next.js · Supabase · Cloudflare R2',
  },
  {
    slug: 'spinroom',
    name: 'SpinRoom',
    kind: 'Creator platform · Live music',
    status: 'In alpha',
    oneLiner: 'A platform for AI-music creators, built as a city: a free live session at the door, a full catalog, authorship proof, and creator commerce behind it.',
    body: [
      'Discord AI-music communities run live listening sessions — a DJ hosts, artists drop tracks, an audience tunes in together. The culture was real but the infrastructure was a notepad and a dozen tabs, and the bigger problem sat underneath: when a session ended, everything vanished into chat history. No record of what played, no proof of who made it, no way to turn a good night into anything that lasted.',
      'SpinRoom is built as a city, revealed one door at a time. The free front door is the live session — a web DJ booth, a Discord bot, and a public audience view as one system, every play kept as a permanent scored record. Behind it the city opens: a SoundCard receipt for every song heard by real people, a SoundStage standing with seasons, a permanent Creator Station, a full catalog, a Trust Office that keeps the contemporaneous record of how each track was made, a Lyric Studio that logs every step as provenance, and a creator storefront. Twenty-four features across a free recognition layer and opt-in catalog and commerce.',
    ],
    outcome:
      'In alpha, built and operated by one person. The recognition core is live in alpha; the rest is partly built or finished-in-design, shipped in the open and labeled as what it is. The reveal — each free step pulling toward the next — is the design.',
    stack: 'Next.js · Supabase · Discord.js · Fly.io',
  },
  {
    slug: 'tidyripples',
    name: 'TidyRipples',
    kind: 'Business design · Services',
    status: 'Designed end to end — for sale',
    oneLiner: 'A complete organizing-business design — physical and digital as one service. Never launched; for sale.',
    body: [
      'Most organizing services sell the cleanup, not the system — the space drifts back toward chaos within weeks, the client calls again, and the cycle repeats. I grew up inside this trade. My mother and aunt ran two successful cleaning businesses on the Grand Strand for nearly 40 years, and while other kids mowed lawns, I organized garages and storerooms. Cleaning was not the calling. Organizing was.',
      'TidyRipples fuses that instinct with over 30 years of custom CRM and automation work into one service model: four service categories spanning physical and digital, a philosophy of five expanding ripples, and a five-stage engagement built to leave clients independent rather than dependent on return visits. The site — fully built, never launched — lays out the philosophy, services, process, and pricing the way a running business would, because the design itself is the showcase.',
    ],
    outcome:
      'A complete business design: positioning, brand, service model, pricing, and an Eleventy site, built end to end. I chose not to operate it — the brand, domain, and design are available to the right buyer.',
    paperId: 'BE99B6B1-DDE0-40D9-A121-D1CA8B349DFF',
    stack: 'Eleventy · Nunjucks · SCSS · Netlify',
  },
  {
    slug: 'trbf',
    name: 'The Right Business First',
    kind: 'Decision framework · Publication',
    status: 'Complete and live — free to use',
    oneLiner: 'A free, constraint-aware framework that eliminates bad business models before any money goes in.',
    body: [
      'Most people who start a business do not fail from lack of effort. They commit to a model that never fit the person running it — wrong hours, wrong energy demands, wrong personality requirements — and find out only after time, money, and identity are already invested. Business advice reinforces the cycle: it starts with opportunity and inspiration and skips the diagnostic step entirely.',
      'The Right Business First works the other way. Four phases — Reality, Discovery, Filtering, Execution — start from the operator’s actual constraints across seven categories, use AI as a bounded expansion engine to generate business architectures that respect them, then narrow the field through five structural filters until one direction remains worth testing. The prompt templates structurally forbid the AI from ranking or recommending. Published as a complete system: over twenty pages of documentation, six worksheets, and a full composite case study.',
    ],
    outcome: 'Complete and live at TheRightBusinessFirst.com. Free, no account required, fully self-service. It started as a book; the site made it executable.',
    href: 'https://therightbusinessfirst.com',
    stack: 'MkDocs Material · Custom CSS · Cloudflare',
  },
  {
    slug: 'claimedfirst',
    name: 'ClaimedFirst',
    kind: 'Concept · Consumer product',
    status: 'Concept — design complete',
    oneLiner: 'A mobile music discovery game where players stake permanent, timestamped claims on AI music creators.',
    body: [
      'ClaimedFirst is built around one feeling: I found them first. Players discover AI music creators and claim them — the first to claim an artist becomes Claimer #1, and that number is permanent and timestamped. Drop an artist and the original position is gone for good. Every claim a player ever makes lives on their profile forever. That record is the reputation.',
      'It is not a stock market game. It is a taste-identity game — the leaderboard is meant to reflect genuine taste, not hours played or money spent. The full design goes well past this page: the game economy, the integrity rules that keep the leaderboard honest, the artist side, and the retention loop are all specified. That part stays off the page on purpose.',
    ],
    outcome:
      'Design complete, nothing built — and deliberately under-described here. The complete design spec is available in a serious conversation.',
    stack: 'Flutter · Supabase (proposed)',
  },
]
