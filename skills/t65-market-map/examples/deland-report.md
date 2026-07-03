# T65 Market Map -- DeLand region (ILLUSTRATIVE SAMPLE)

> ⚠️ **Sample output.** Numbers below are realistic illustrations, not a live
> pull. Add a free Census API key and run `scripts/census_pull.py` to replace
> every cell with exact ACS 2022 figures. Format and ranking logic are final.

_Source (when live): U.S. Census ACS 2022 5-year estimates._

**Current Medicare market (65+): ~42,310 people across 7 ZIPs**
**5-year pipeline (age 60-64): ~13,550 aging in**

| Rank | ZIP | Area | 65+ market | 60-64 pipeline | % 65+ | Median income | Score |
|----:|:----|:-----|----------:|--------------:|-----:|--------------:|------:|
| 1 | 32763 | Orange City | 9,600 | 2,100 | 30.0% | $52,000 | 7,167 |
| 2 | 32724 | DeLand (E/N) | 7,220 | 2,400 | 19.0% | $68,000 | 5,316 |
| 3 | 32720 | DeLand (W) | 5,940 | 1,700 | 22.0% | $74,000 | 4,777 |
| 4 | 32713 | DeBary | 5,460 | 1,500 | 26.0% | $76,000 | 4,702 |
| 5 | 32738 | Deltona (E) | 7,050 | 2,900 | 15.0% | $63,000 | 4,697 |
| 6 | 32725 | Deltona (W) | 5,600 | 2,500 | 14.0% | $60,000 | 3,584 |
| 7 | 32744 | Lake Helen | 1,440 | 450 | 24.0% | $70,000 | 1,154 |

**How to read this:** *65+ market* = today's Medicare-eligible population.
*60-64 pipeline* = the built-in future book; these people turn 65 within five
years and can be marketed to compliantly as they approach eligibility. *Score*
blends market size, 65+ density (cheaper to target), and income (Medigap
affordability).

## What this says for DeLand specifically
- **Start in Orange City (32763) and DeBary (32713).** Highest 65+ *density*
  (30% and 26%) means a mailer or seminar there hits seniors far more
  efficiently than blanketing Deltona.
- **DeBary + west DeLand are the Medigap plays** -- highest median income
  ($76k / $74k), which supports Medicare Supplement premiums and the renewable
  commissions that make a part-time book profitable.
- **Deltona (32738/32725) is volume, not density.** Big raw 65+ counts but a
  younger, lower-income, MA-leaning population -- the largest *pipeline* (5,400
  people 60-64). Good for a long-game "Welcome to Medicare" nurture, weaker for
  near-term Medigap.
- **County context:** Volusia runs ~55-60% Medicare Advantage penetration. MA is
  where the bodies are but it's crowded and rule-heavy; Medigap in the
  higher-income ZIPs is the lower-competition, higher-margin lane.

> Compliance: market intelligence only -- no contact lists, no PII. Do not
> cold-call about Medicare Advantage/Part D. See
> `references/medicare-compliance.md`.
