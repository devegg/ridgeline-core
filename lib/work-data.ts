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
    status: 'In development',
    oneLiner: 'A storefront for a 900-song catalog, engineered to a $26-a-month infrastructure ceiling.',
    body: [
      'Heart Echoes Music is a 900-song AI-assisted catalog that needed a store serving two different buyers from one codebase: fans buying downloads, and producers buying MIDI and stem packs.',
      'The build is an exercise in cost discipline and data-migration rigor: a hybrid Supabase + Cloudflare R2 architecture with a fixed monthly ceiling, an Airtable-to-PostgreSQL migration with source-id anchoring, and human curation rules enforced in the pipeline.',
    ],
    outcome: 'In active development. The architecture and migration discipline are the story — the white paper walks through both.',
    stack: 'Next.js · Supabase · Cloudflare R2',
  },
  {
    slug: 'songledger',
    name: 'SongLedger',
    kind: 'Music software · SaaS',
    status: 'In active testing',
    oneLiner: 'Catalog management and proof of authorship for AI-music creators — the record builds itself as they work.',
    body: [
      'AI-music creators have built real catalogs — dozens of songs, sometimes hundreds — with no infrastructure behind them: MP3 folders, spreadsheets, no metadata, no proof of how the work was made. The Copyright Office’s January 2025 guidance made the stakes plain: what’s protected is human-authored work documented before the AI generates, and holding rights is not the same as proving them.',
      'SongLedger puts the catalog, the writing, the proof, and the sales in one place. Full metadata on every song, lyric writing that saves every version as a snapshot, and a Creative Provenance log — a SHA-256 hash chain, timestamped before generation runs, exportable as a signed PDF, publicly verifiable. A Showcase layer lets creators sell direct and keep 100 percent, and provenance runs $1–$3 a song against $97 per instance for the comparable standalone service.',
    ],
    outcome: 'In active testing at songledger.app, pre-launch. The working test case is a 960-song catalog migration.',
    href: 'https://songledger.app',
    stack: 'React · Firebase Firestore · Cloudflare R2 · Stripe',
  },
  {
    slug: 'artisticshield',
    name: 'ArtisticShield',
    kind: 'Music rights · Product',
    status: 'Pre-launch',
    oneLiner: 'A public verification layer for music authorship — anyone can check a song’s proof record by Song ID, no account.',
    body: [
      'When a song is made with AI tools, who made it is a genuinely complicated question. The U.S. Copyright Office’s January 2025 report drew the line: prompts alone generally are not protected expression — original human-authored lyrics, fixed before the AI generated anything, are. But copyright attaches automatically and evidence does not. A creator defending that claim months later has memory, surviving files, and file timestamps, and none of it survives scrutiny.',
      'ArtisticShield is the public verification layer paired with SongLedger, the private creator workspace. Inside SongLedger, every lyric version is hashed with SHA-256 server-side and chained to the prior hash, and a Pre-Upload Lock timestamps lyrics as final before any AI generation runs. On ArtisticShield, anyone can look up a Song ID and see the verified proof record — no account, no login — and the full log exports as a PDF that stands on its own in front of counsel or a counterparty.',
    ],
    outcome:
      'Pre-launch alongside SongLedger. The trust chain is built — hashed lyric versions, the Pre-Upload Lock, public lookup by Song ID, portable PDF export — and every song sold through SongLedger’s Showcase must carry it.',
    stack: 'React 19 · Node.js · Firebase Firestore · Cloudflare R2',
  },
  {
    slug: 'spinroom',
    name: 'Spinroom',
    kind: 'Community platform · Live music',
    status: 'In alpha',
    oneLiner: 'A free live-session platform for Discord AI-music communities: DJ booth, bot, and audience view in one system.',
    body: [
      'Discord communities built around AI music run live listening sessions — a DJ hosts, artists submit tracks, and an audience tunes in together through a voice channel. The infrastructure behind it was a notepad, a Suno playlist, and a busy text channel the DJ could not look away from. When a session ended, the track list vanished into chat history: no scores, no archive, and no public way to find the next one.',
      'Spinroom connects a web DJ booth, a Discord bot, and a real-time audience view into one coordinated system. Artists paste a Suno link; the bot builds the queue and enforces the submission rules. Every session persists as a scored archive, and a public schedule lists every live and upcoming session — no login required. Built first on Firebase, now rebuilt as the live layer of a larger creator platform on Supabase and Next.js.',
    ],
    outcome:
      'In alpha. Live sessions, song showcases, and the leaderboard are built; the roadmap runs to a first official season in July 2026.',
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
      'ClaimedFirst is built around one feeling: I found them first. Players discover AI music creators and claim them — the first to claim an artist becomes Claimer #1, and that number is permanent and timestamped. Drop an artist and the original position is gone for good; re-add them later and you take a new number at the back of the line. Every claim a player ever makes lives on their profile forever. That record is the reputation.',
      'It is not a stock market game. It is a taste-identity game, designed so the leaderboard reflects genuine taste — not hours played or money spent. The design covers the whole game: claim mechanics and the 30-day cooldown that closes the obvious scoring exploit, tiered roster storage as the revenue mechanic (pay to enhance, never pay to win), a scoring system that pairs early faith with artist growth, the artist side of the game, anti-gaming rules, and the daily retention loop. Claim data lives in the game’s own database, so nothing critical depends on outside music-platform APIs.',
    ],
    outcome:
      'Design complete, nothing built. Shown here as proof of product-design range: mechanics, economy, and integrity rules specified before a line of code.',
    stack: 'Flutter · Supabase (proposed)',
  },
]
