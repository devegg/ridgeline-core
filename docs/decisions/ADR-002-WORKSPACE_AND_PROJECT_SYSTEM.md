# ADR-002: Ridgeline Workspace & Repeatable Project System

**Status**: Accepted (design approved in session 2026-07-03; supersedes the workspace-level implications of ADR-001, which remains valid for per-project internals it defined)
**Date**: July 2026
**Author**: Brian Boyd, with Claude Code

## Context

Work currently sprawls across `~/0/` (eleven project folders in inconsistent shape — some with git + CLAUDE.md, some loose piles of markdown), plus older roots (`~/Projects/b/salem`, `~/Projects/SongLedger`, `~/Documents/Karen-Steele`) and a junk drawer of loose files. Three inputs shaped this decision:

1. **BidScovery/RFQ Hunter** — the most evolved project — earned its structure through pain and taught four lessons:
   - A product rename (BidScovery → RFQ Hunter) leaks everywhere when the name is baked into folders, repos, skills, and payment products. Its decisions log (D67) locked the display name and *deferred* the structural renames as separately-scoped tasks.
   - A **two-authority doc model** works: one live *status* authority (what is actually shipped) and one *decisions* authority (what is locked + open TBDs); everything else defers to them, and code is ground truth over any doc.
   - **Paths are load-bearing**: hooks, permission allowlists, and scripts hardcode absolute paths; Claude Code session history and per-project memory are keyed by absolute path. Any folder move needs a fix-up pass.
   - A **generated PR log** (`PR-NOTES.md` from `gh`, D97) plus a **scrubbed single-file snapshot** (`combine-files.cjs`) lets a claude.ai Project plan against complete, current truth while Claude Code develops in parallel.
2. **Ridgeline ADR-001** defined a sound per-project skeleton and a scaffolder, but predates the BidScovery lessons: no CLAUDE.md, no authority docs, no naming policy, no Claude tooling.
3. **The "Business OS" pattern** (Claude Code tutorial): one master CLAUDE.md at the workspace root holding voice/rules/context written once; per-project CLAUDE.md files below it; Claude Code walks the tree upward and the closest file wins — so nothing is ever repeated.

The marketing site (RidgelineKnows.com) already exists as the Ridgeline app's homepage and must showcase portfolio projects, including white papers.

## Decision

### 1. `~/0/ridgeline/` becomes the workspace umbrella

The Ridgeline app descends one level to `~/0/ridgeline/core/` (folder matches its GitHub repo, `devegg/ridgeline-core`). The workspace root gets its own small git repo (`ridgeline-workspace`) tracking only workspace-level files, with `core/`, `projects/`, and `clients/` gitignored (each child is its own repo).

```
~/0/ridgeline/                      ← THE workspace (git: ridgeline-workspace)
├── CLAUDE.md                       ← MASTER: identity, voice, rules (≤200 lines)
├── README.md                       ← map of the workspace
├── docs/
│   ├── decisions/                  ← ADR-001 (relocated), this ADR, future ADRs
│   └── PLAYBOOK.md                 ← naming policy, move checklist, snapshot pipeline
├── template/                       ← project template v2 (retires ridgeline-template)
├── scripts/                        ← scaffold-project.sh v2, combine-files.cjs,
│   │                                  gen-pr-notes.mjs, snapshot.sh
├── _inbox/                         ← loose files awaiting a home
├── core/                           ← the Ridgeline app (git: ridgeline-core)
├── projects/                       ← products & portfolio pieces, one repo each
└── clients/                        ← client work: clients/<client>/<project>/
```

### 2. Migrate on commitment

Only **finished projects and projects Brian plans to finish** move into the workspace. Everything else stays where it is (`~/0/` siblings are the "undecided" zone) and may move later — or never. Moving a project in *is* the promotion signal; the workspace is curated by definition. BidScovery/RFQ Hunter explicitly stays at `~/0/bidscovery` (most to lose, self-sufficient CLAUDE.md, may never move).

First movers: **MovieSlotMachine**, then **GridStrain** (verified: clean trees, fully pushed, zero hardcoded paths). Next candidates decided after the pilots.

### 3. Project template v2

ADR-001's skeleton plus the BidScovery lessons, tiered so small projects aren't buried in ceremony.

```
<codename>/
├── CLAUDE.md          # ≤200 lines; points at docs ("table of contents, not encyclopedia")
├── README.md
├── BACKLOG.md
├── project.yaml       # manifest — see naming policy
├── docs/
│   ├── STATUS.md      # status authority: what is actually shipped (runbook-lite)
│   ├── DECISIONS.md   # decisions authority: D# log + open-items/TBD register
│   ├── PR-NOTES.md    # GENERATED full PR log (gen-pr-notes.mjs; PR-flow projects)
│   ├── plans/         # build plans (tracked, kept)
│   ├── research/
│   ├── portfolio/     # case study + white paper drafts → feeds the marketing site
│   └── gitignored/    # local-only reference + snapshots/
├── .claude/           # settings.json, skills/ as needed
├── app/ or src/       # stack-specific
└── scripts/
```

**Mandatory tier**: CLAUDE.md, README.md, project.yaml, STATUS.md, DECISIONS.md. Everything else appears when the project needs it. Code is ground truth; STATUS and DECISIONS are the two authorities; docs reconcile to them.

### 4. Naming policy (the anti-rename-debt rule)

- Folder name = repo name = **permanent kebab-case codename**. Never renamed.
- Display/brand name lives in **one place**: `project.yaml` (`display_name:`). Marketing pulls from there.
- A product rename = one manifest line + marketing copy. Folders, repos, skills, and database names never move.
- `project.yaml` carries: `codename`, `display_name`, `client` (or `self`), `status`, one-line `description`, `portfolio: true/false`, and the Ridgeline app's project record ID — making the workspace machine-readable.

### 5. Master CLAUDE.md inheritance

Voice, banned words, working rules, and business context live once in `~/0/ridgeline/CLAUDE.md`. Per-project CLAUDE.md files hold only project-specific content. Claude Code combines them, closest file winning. Projects outside the workspace (bidscovery) rely on their own CLAUDE.md, unaffected.

### 6. Planning pipeline (claude.ai Project ↔ Claude Code, in parallel)

Generalized from BidScovery: a per-project snapshot uploaded to that project's claude.ai Project, so planning conversations run against full current truth while Claude Code develops locally.

**Fixed sequence** (order is the discipline): 1) reconcile docs to code (STATUS/DECISIONS current), 2) regenerate `docs/PR-NOTES.md`, 3) run the snapshot, 4) upload to the claude.ai Project.

- `scripts/snapshot.sh <project>` wraps `combine-files.cjs` (secret-scrubbing, binary/lockfile exclusion, size caps, skipped-files report) + `gen-pr-notes.mjs`; output to `<project>/docs/gitignored/snapshots/<codename>-YYYY-MM-DD[a].txt`.
- Chosen over claude.ai's GitHub-repo sync deliberately: one curated scrubbed file beats a synced file tree — it captures unpushed local state and refreshes with a single delete-and-upload.

### 7. Marketing site & portfolio (inside `core/`)

The existing homepage stays. Add public `/work` (portfolio index from manifests where `portfolio: true`) and `/papers` (white papers). Portfolio content is **authored in each project's `docs/portfolio/`** — proof lives with the work — and surfaced through core's documents feature (new `is_public` flag + anon-read RLS + public routes; the existing MarkdownViewer renders). A workspace script syncs portfolio docs + manifests into core. First raw material: BidScovery's `RFQ-Hunter-Story.md` and the Salem case study from the website-content draft (no folder moves required).

## Migration phases

- **Phase 0 — protect the work**: commit and push the Ridgeline app (everything since May is uncommitted on a one-commit `master`). Nothing moves before this.
- **Phase 1 — workspace shell**: the two-step shuffle (`ridgeline` → `ridgeline/core`), init workspace repo, master CLAUDE.md, PLAYBOOK.md, relocate ADRs, sweep `~/0/` loose files into `_inbox/`, verify core runs (dev server, Vercel link, Supabase link).
- **Phase 2 — template v2 + scaffolder**: build `template/`, rewrite `scaffold-project.sh` (with `--client` flag choosing `projects/` vs `clients/<client>/`), update core's scaffolder action (`TARGET_DIR`), retire `ridgeline-template/`. Port snapshot + PR-notes scripts into `scripts/`.
- **Phase 3 — pilots**: MovieSlotMachine, then GridStrain, via the move checklist; retrofit template v2; prove the checklist.
- **Phase 4 — review + migrate on commitment**: candidates (hem-storefront, all-these-doors, trades-platform, _Loho…) move only when Brian commits to finishing them.
- **Phase 5 — marketing surface**: `/work`, `/papers`, `is_public` documents migration, first two portfolio entries.

**Per-project move checklist** (full version to live in PLAYBOOK.md):
1) clean `git status`, all pushed; 2) `mv` to `ridgeline/projects/<codename>` (kebab-case at move time; optional GitHub repo rename — auto-redirects); 3) move the Claude Code brain: `~/.claude/projects/<old-path-key>` → new path key (session history **and** per-project memory); 4) grep for `/Users/brianboyd` absolute paths, fix; 5) retrofit template v2; 6) launch `claude` in the new path, smoke test, update the core app's project record.

## Consequences

**Positive**: one umbrella matching the brand ("Ridgeline knows"); every committed project immediately familiar; rename-proof naming; planning side always current; portfolio pipeline built into where work already happens; structure identical for personal and client work (clients/ exists from day one).

**Negative / accepted costs**: one-time app path change (core/) while history is still one commit deep; each project move needs the fix-up pass (checklist exists precisely for this); one more repo (workspace meta); deeper paths (`~/0/ridgeline/projects/<x>`).

## Out of scope / deferred

- BidScovery folder move and its repo/skill/Stripe renames (owned by its own D67 deferral; may never happen).
- Consolidating the older roots (`~/Projects/*`, `~/Documents/*`) — migrate-on-commitment applies to them too, later.
- Automating the portfolio sync beyond a simple script; anything resembling CI for snapshots.

## References

- ADR-001 (per-project structure, scaffolder) — extended, not replaced
- BidScovery: `docs/_authority/README.md` (authority model), CLAUDE.md (naming deferral, D67/D97), `combine-files.cjs`, `gen-pr-notes.mjs`
- "The only Claude Code tutorial you'll ever need" (scrapeshq.notion.site) — Business-OS CLAUDE.md inheritance
