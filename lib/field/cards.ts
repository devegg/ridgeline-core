/**
 * The trade field cards, by slug.
 *
 * Mirrors docs/business-dev/scenarios/<slug>.md in the ridgeline workspace
 * repo. Hardcoded rather than read from disk on purpose: those files are in a
 * different repository and this app deploys without them, so a filesystem
 * read would work locally and return nothing in production.
 *
 * Ordered by the owner's own ranking (docs/business-dev/TRADES.md, 2026-08-25)
 * so the four trades actually being called on are the first ones offered.
 */

/** Ranked "yes" — the trades worth planning a day around. */
export const IN_TRADE_CARDS = [
  'hvac-plumbing-electrical',
  'construction-general-contracting',
  'tree-service-landscaping',
  'accounting-law-office',
] as const

/** Everything else with a card, in case a door opens unexpectedly. */
export const OTHER_TRADE_CARDS = [
  'property-management',
  'vacation-rental-management',
  'dental',
  'medical-practice',
  'nonprofit',
  'auto-repair',
  'trucking-delivery',
  'marine-boat-services',
  'hotel-motel',
  'self-storage',
  'restaurant',
  'entertainment-venues',
  'retail-beach-tourist',
  'salon-spa',
] as const

export const TRADE_CARDS: string[] = [...IN_TRADE_CARDS, ...OTHER_TRADE_CARDS]
