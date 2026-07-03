# Portfolio Source Inventory — for /work + /papers (swept 2026-07-03)

What exists on disk to power the weekend content push. Best-source paths verified by sweep.

| Project | State | Best source | Standout |
|---|---|---|---|
| **Salem Smart Log** | LIVE in production | `~/Projects/b/salem/SALEM_CASE_STUDY.md` (finished case study) | ~$2.4M tracked, 419 jobs, ~3,600 DFAS transactions, single developer |
| **RFQ Hunter** | Private beta | `~/0/bidscovery/docs/planning/RFQ-Hunter-Story.md` | 400+ merged PRs; DLA-data moat |
| **HEM Storefront** | In dev | `~/0/hem-storefront/docs/CASE_STUDY.md` (finished case study) | 900-song catalog, $26/mo infra ceiling, dual-audience storefront |
| **SpinRoom v3** | Alpha (Season 1 July '26) | `~/Projects/a/SpinRoom/docs/project-reference.md` | Live DJ sessions → permanent catalog; Discord bot + realtime |
| **SongLedger** | Pre-launch at songledger.app | `~/Projects/SongLedger/SongLedger Mission Statement (2 versions).md` | Creative Provenance differentiator; also = SpinRoom v1 lineage |
| **TRBF** (framework + app) | Complete, paused | `~/Projects/therightbusinessfirst/` (canonical) + `~/Projects/trbf-app/` (Astro) | Book → framework → site; five-phase model; shows versatility |
| **TidyRipples** | Live site (Eleventy) | `~/TidyRipples/` + analysis in `~/TidyRipples-bak/tidyripples-website-analysis.md` | Owner has domain; "cool story" — get it from Brian directly |
| **ClaimedFirst** | Concept, design complete | `~/Projects/a/ClaimedFirst/claimedfirst-concept-brief.md` (+ existing teaser-page prompt!) | Taste-game mechanics fully designed; portfolio-as-concept piece |
| GridStrain / Movie Slot Machine | LIVE | in-repo READMEs + this session's proof-card copy | hourly self-refreshing pipeline / shipped consumer app |

**Blockers/notes**
- `~/Documents/Job Search/portfolio/` (6 case-study folders incl. ACME_Mfg-demo,
  ArtisticShield-com, TidyRipples-com) is **unreadable — macOS denies Documents access**
  to the terminal. Fix: System Settings → Privacy & Security → Files & Folders (or Full
  Disk Access) for the terminal/Claude, or copy the folders somewhere readable.
- ClaimedFirst already has a "Teaser landing page prompt.md" — read it before writing the
  Claude Design prompt; merge rather than duplicate.
- Weekend flow per plan Tier 2: is_public migration → /work + /papers routes → adapt
  Salem + HEM finished case studies first (lowest lift), then RFQ Hunter story, then the
  concept pieces (TidyRipples, TRBF, SpinRoom, ClaimedFirst) + Claude Design prompts.

## Job Search case studies (unblocked 2026-07-03, copied to _inbox/portfolio/)

The Documents-access blocker above is resolved for these six: all copied to
`~/0/ridgeline/_inbox/portfolio/`. Each folder holds a matching HTML source + PDF render
(PDF/PNG renders also duplicated at the portfolio root). All six are finished,
print-ready case studies in one shared design system (Problem → Solution → Data → Stack,
Cormorant Garamond/Libre Baskerville/DM Mono), dated April 2026 — adaptation-ready copy,
not drafts.

| Project | Essence | State | Best source | Standout |
|---|---|---|---|---|
| **ACME Smart Log** | Speculative demo of an AI ops platform for a DoD supplier who ran 20 years on handwritten log sheets mailed/faxed 550 miles for manual reconciliation. Owner keeps the paper form, photographs it; Claude Vision OCR ingests it, a three-key match (job # + gov PO + NSN) reconciles against DoD payment data, plus email invoice ingestion and on-demand monthly report. Fictionalized from the real Salem engagement. | Finished case study; demo app seeded with real-shaped data | `~/0/ridgeline/_inbox/portfolio/ACME_Mfg-demo/acme-smart-log-case-study.html` | First reconciliation run surfaced 249 discrepancies (90 critical) nobody knew existed across 419 jobs / ~3,600 payment records / $2.4M; "the reconciliation you spend hours on — watch it happen in 30 seconds" |
| **ArtisticShield** | Public verification layer companion to SongLedger, closing the authorship-evidence gap for AI music. Lyric versions are SHA-256 hashed and chained with server timestamps; a Pre-Upload Lock proves lyrics existed before AI generation; anyone can verify a proof record by Song ID at ArtisticShield.com with no account, and the log exports as a portable PDF. | Finished case study; companion brand of pre-launch SongLedger | `~/0/ridgeline/_inbox/portfolio/ArtisticShield-com/artisticshield-case-study.html` | Built directly on the Jan 2025 U.S. Copyright Office AI report; "Copyright attaches automatically. Evidence does not." |
| **SongLedger** | Subscription SaaS giving AI-music creators catalog management (full metadata schema, playlists, saved views), guided AI lyric writing with versioned snapshots, Creative Provenance documentation as a byproduct of the work, and a public Showcase sales layer. In active testing at songledger.app. | Finished case study; product pre-launch (active testing, Apr 2026) | `~/0/ridgeline/_inbox/portfolio/SongLedger-app/songledger-portfolio.html` | 960-song migration test; provenance at $1–$3/song vs. $97/instance for the comparable standalone service; sellers keep 100% |
| **Spinroom** | Free live listening-session platform for Discord AI-music communities: web DJ booth + Discord bot + real-time audience view as one coordinated system. Bot builds the queue from Suno links and enforces submission rules; every session persists as a scored archive; public schedule directory lets anyone walk into a live session with no login. | Finished case study; free community platform (v3 alpha per row above) | `~/0/ridgeline/_inbox/portfolio/Spinroom-app/spinroom-portfolio.html` | "The first time the scene has had a single public entry point" — plus the quotable before-state: "a DJ with a notepad, a Suno playlist, and a Discord window they could not take their eyes off of" |
| **TidyRipples** | Complete business plan + brand + live Eleventy site for Brian's own professional organizing/systems business. The five "expanding ripples" philosophy is the load-bearing structure for four service categories and a five-stage engagement designed to leave clients independent rather than dependent on return visits. | Finished case study; live site | `~/0/ridgeline/_inbox/portfolio/TidyRipples-com/tidyripples-case-study.html` | ~40-year family legacy on the Grand Strand; "Organization is not the deliverable. The cascade that follows is the deliverable." |
| **TRBF** | Constraint-aware business decision framework published free at TheRightBusinessFirst.com (MkDocs Material): four phases — Reality → Discovery → Filtering → Execution — over seven constraint categories, using AI as a "bounded expansion engine" explicitly barred from ranking or recommending. 20+ doc pages, six worksheets, full composite case study. | Finished case study; site complete + live, no account required | `~/0/ridgeline/_inbox/portfolio/TRBF-com/trbf-case-study.html` | "Eliminates bad decisions through logic, not inspiration" — AI prompt templates that structurally forbid the AI from choosing for you |

**The TidyRipples story — now on paper.** The "get it from Brian directly" note above is
resolved: the case study's Origin section tells it. As a kid, while other kids mowed lawns
for pocket money, Brian organized garages and storerooms. His mother and aunt ran two
successful cleaning businesses on the Grand Strand for nearly 40 years — Bonnie's Cleaning
Service and Capital Cleaning (construction cleaning + office/condo maintenance) — and that
early exposure shaped the eye. "Cleaning was not the calling. Organizing was." Fused with
30+ years of custom CRM/automation work, it became one physical + digital service model.

**Reconcile before publishing:** the TRBF row above says "five-phase model"; this case
study presents four phases. Also note ACME = anonymized Salem — decide whether /work shows
one or both. Portfolio root additionally holds `The_Architect_s_Proof.pdf`, two brand-story
.mp4s, and a "Designing systems around human constraints" .m4a — unswept media, possible
/papers or About-page assets.
