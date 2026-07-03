---
name: t65-market-map
description: >
  Build a "Turning 65" Medicare market map for any U.S. territory. Pulls free
  U.S. Census data to rank ZIP codes by current 65+ population, the 60-64
  pipeline aging into Medicare, 65+ density, and household income -- so an
  insurance agent knows exactly where to focus compliant marketing (mailers,
  seminars, referral partners). Use when the user wants Medicare/Medigap lead
  targeting, a senior-market territory analysis, or a "where are the prospects"
  report for an insurance, annuity, or final-expense business.
---

# T65 Market Map

Turns a raw territory into a ranked Medicare-prospecting map using free public
data. This is **market intelligence**, not a contact list -- it tells an agent
*where* the opportunity is so they can market there compliantly. It never
produces phone numbers or names, because Medicare lead gen is regulated (see
`references/medicare-compliance.md`).

## When to use
- An insurance agent wants to know which ZIPs to work for Medicare / Medigap.
- Someone is (re)starting a senior-market practice and needs a territory plan.
- You need to size the "aging-in" pipeline for a county or metro.

## Setup (first run)
1. **Get a free Census API key** (instant, no card):
   https://api.census.gov/data/key_signup.html
2. Save it: `mkdir -p ~/.config/t65 && echo 'CENSUS_API_KEY=THEKEY' > ~/.config/t65/.env`
   (or `export CENSUS_API_KEY=THEKEY`).
3. Confirm the agent's **product focus** (Medicare Advantage, Medigap, or both)
   and **territory** (a list of ZIP codes, a county, or a city + radius). If you
   only have a county/city, look up its ZIP codes first, then pass them in.

## Workflow
1. Resolve the territory to a comma-separated ZIP list.
2. Run the puller:
   ```
   python3 scripts/census_pull.py \
     --zips 32720,32724,32763,32725,32738,32713,32744 \
     --label "DeLand region" \
     --out examples/deland-report
   ```
3. Read back the ranked table. Lead with the top 3-5 ZIPs and explain the
   *why* (size vs. density vs. income), then recommend channel:
   - High 65+ **density** ZIPs -> educational seminars + direct mail are efficient.
   - High **income** ZIPs -> Medigap (renewable commissions, stickier clients).
   - Large **60-64 pipeline** -> start a "Welcome to Medicare" nurture now.
4. Pair with referral-partner sourcing (see "Skill B" note below) so the agent
   has a compliant, permission-based pipeline -- not cold calls.

## Output
- `<out>.md` -- the ranked report (hand this to the agent).
- `<out>.json` -- structured data for charts or a future web dashboard.

## Compliance guardrails (read this)
- **No cold-calling Medicare Advantage / Part D.** CMS prohibits unsolicited
  MA/PDP contact. Marketing must be permission-based, referral-based, or
  inbound. TCPA + Do-Not-Call also apply to all calls/texts.
- This skill outputs **aggregate geography only** -- never individual PII.
- Medigap (Medicare Supplement) marketing is state-regulated and generally less
  restrictive than MA/PDP, which is why it's often the better lane for a
  part-time agent. Full detail in `references/medicare-compliance.md`.

## Monetization notes (for the RidgelineKnows product)
- Free skill = lead magnet + proof. The free Census key is the only dependency.
- Done-for-you: run this monthly per client territory on retainer.
- Upgrade path: the JSON output feeds the Next.js/Supabase app for a paid,
  self-serve "territory dashboard" (add CMS plan-penetration + competitor data).
