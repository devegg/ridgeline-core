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
    slug: 'dod-contractor-platform',
    name: 'Operations platform for a DoD contractor',
    kind: 'Client work · Defense manufacturing',
    status: 'Live in production',
    oneLiner: 'A two-person precision-parts operation moved off paper, spreadsheets, and one person’s memory.',
    body: [
      'A two-person DoD contractor ran a precision-parts operation on handwritten job forms, Excel, and email. Job status lived in one person’s head. Government payment reconciliation was done by hand against 48-column CSV extracts.',
      'I designed and built a purpose-built operations platform: live job tracking, camera-to-data form intake with AI document reading, automated reconciliation of government payments, inquiry management with deadline alerts, and a complete audit trail.',
    ],
    outcome: 'In production, in daily use — roughly $2.4M in business data tracked across 419 job orders and ~3,600 payment transactions. One developer, zero shortcuts. Client name held back; references available in a serious conversation.',
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
]
