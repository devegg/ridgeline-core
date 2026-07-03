# Ridgeline Workspace Phases 0–3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, with phase checkpoints) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Subagent-per-task is NOT recommended here: Tasks 3–7 mutate the working directory layout that concurrent agents would depend on.

**Goal:** Execute ADR-002 Phases 0–3 — protect the app's uncommitted work, convert `~/0/ridgeline/` into the workspace umbrella (app → `core/`), build template v2 + scaffolder v2, and migrate the two pilot projects (MovieSlotMachine, GridStrain).

**Architecture:** Pure filesystem/git/shell work plus two small TypeScript/Node scripts and one server-action edit. The workspace root becomes a new git repo (`ridgeline-workspace`) tracking only workspace-level files; `core/`, `projects/`, `clients/` are gitignored child repos. Spec: `docs/decisions/ADR-002-WORKSPACE_AND_PROJECT_SYSTEM.md` (in this repo until Task 5 relocates both it and this plan to the workspace).

**Tech Stack:** bash (macOS/BSD sed), git + `gh` CLI, Node ≥18 (`.mjs` scripts), Next.js app in `core/`, Supabase MCP (project restore).

## Global Constraints

- Naming policy (ADR-002 §4): folder = repo = permanent kebab-case codename; display name only in `project.yaml`.
- BidScovery/RFQ Hunter (`~/0/bidscovery`) is **hands-off** — never moved, renamed, or edited by this plan.
- Migrate-on-commitment: this plan moves ONLY MovieSlotMachine and GridStrain. No other folder in `~/0/` moves except loose *files* swept to `_inbox/` (Task 6). Folders (`Salem Issue`, `_app`, `_Loho`, etc.) stay put.
- Template mandatory tier (ADR-002 §3): CLAUDE.md, README.md, project.yaml, docs/STATUS.md, docs/DECISIONS.md.
- All commands from Task 3 onward use **absolute paths** (the shuffle changes what relative paths mean).
- Every git commit in `core/` and the workspace ends with the standard `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` footer.
- **Checkpoints:** stop for owner review after Tasks 2, 8, 14, and 18. Do not roll into the next phase without a go.

---

## PHASE 0 — Protect the work

### Task 1: Pre-commit hygiene sweep

**Files:**
- Move out: `lifecycle-timeline-outline.md` → `/Users/brianboyd/0/` (HEM album content; does not belong in ridgeline-core history — it gets swept to `_inbox/` in Task 6)
- Verify: `.gitignore` coverage; no large/sensitive files staged

- [ ] **Step 1: Park the HEM outline outside the repo**

```bash
mv /Users/brianboyd/0/ridgeline/lifecycle-timeline-outline.md /Users/brianboyd/0/
```

- [ ] **Step 2: Verify ignore rules protect secrets and local refs**

```bash
cd /Users/brianboyd/0/ridgeline
git check-ignore .env.local && git check-ignore docs/gitignored/business-cards.png && git check-ignore .DS_Store
```
Expected: all three paths echoed back. If any is NOT echoed, append the missing pattern to `.gitignore` (one per line: `.env.local`, `/docs/gitignored/`, `.DS_Store`) before proceeding.

- [ ] **Step 3: Scan for accidental large files**

```bash
find /Users/brianboyd/0/ridgeline -size +5M -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' -not -path '*/docs/gitignored/*'
```
Expected: no output. If anything appears, show it to the owner before committing.

- [ ] **Step 4: Eyeball the full untracked list**

```bash
git status --short
```
Expected: the app tree (`app/`, `components/`, `lib/`, `supabase/`, configs, `skills/`, `docs/`), `.env.local.example` (the template — correct to commit), NO `.env.local`, NO `lifecycle-timeline-outline.md`.

### Task 2: The Phase-0 commit ⛔ CHECKPOINT after this task

- [ ] **Step 1: Commit everything**

```bash
cd /Users/brianboyd/0/ridgeline
git add -A
git commit -m "feat: Ridgeline platform — dashboard, client portal, documents, billing, scaffolder UI

Everything built May–June 2026: Next.js App Router app (dashboard sections:
clients, contacts, leads, projects, proposals, assessments, deliverables,
billing, communications, documents, cleanup, scaffolder, overview; client
portal; marketing homepage), Supabase schema migrations 20260101–20260107
(core schema, scheduled-delete, portal RLS, contacts, app_metadata RLS,
leads, documents), t65-market-map skill, docs and backlog.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 2: Push and verify the remote has it**

```bash
git push origin master
git status && git log origin/master --oneline -1
```
Expected: `working tree clean`; origin/master's tip = the commit just made.

**⛔ CHECKPOINT: report to owner — Phase 0 done, work is off-machine. Get go for Phase 1.**

---

## PHASE 1 — Workspace shell

### Task 3: The shuffle (app descends to `core/`)

**Files:** none created — pure directory restructure. Run the three commands as ONE bash invocation, absolute paths only.

- [ ] **Step 1: Preflight — clean tree, no dev server**

```bash
git -C /Users/brianboyd/0/ridgeline status --porcelain
lsof -ti :3000 || echo "port 3000 free"
```
Expected: empty status; "port 3000 free" (if a PID prints, stop the dev server first).

- [ ] **Step 2: Shuffle**

```bash
mkdir /Users/brianboyd/0/ridgeline-tmp && mv /Users/brianboyd/0/ridgeline /Users/brianboyd/0/ridgeline-tmp/core && mv /Users/brianboyd/0/ridgeline-tmp /Users/brianboyd/0/ridgeline
```

- [ ] **Step 3: Verify the app repo is intact at the new path**

```bash
ls /Users/brianboyd/0/ridgeline && git -C /Users/brianboyd/0/ridgeline/core status && git -C /Users/brianboyd/0/ridgeline/core log --oneline -1
```
Expected: `core` listed; clean tree; tip commit = Phase-0 commit.

**Note for the executing session:** its cwd path (`/Users/brianboyd/0/ridgeline`) now resolves to the workspace root, not the app. Claude Code's project-data key `-Users-brianboyd-0-ridgeline` (session history + memory) deliberately stays attached to the workspace root — the existing memories are workspace-level. Sessions on the app itself henceforth open in `core/` and build fresh history there.

### Task 4: Workspace root files

**Files:**
- Create: `/Users/brianboyd/0/ridgeline/CLAUDE.md`, `README.md`, `.gitignore`, `docs/PLAYBOOK.md`
- Create dirs: `docs/decisions/`, `docs/plans/`, `template/`, `scripts/`, `projects/`, `clients/`, `_inbox/`

- [ ] **Step 1: Create the directory skeleton**

```bash
mkdir -p /Users/brianboyd/0/ridgeline/{docs/decisions,docs/plans,template,scripts,projects,clients,_inbox}
```

- [ ] **Step 2: Write the master CLAUDE.md** — exactly:

```markdown
# Ridgeline — workspace master memory

This folder is the Ridgeline workspace: Brian Boyd's consulting brand
(RidgelineKnows.com) and every project committed to under it. Everything in
`core/`, `projects/`, and `clients/` inherits this file.

## The map
- `core/` — the Ridgeline app: marketing site + ops dashboard + client portal (repo: ridgeline-core)
- `projects/` — products & portfolio pieces, one repo per folder
- `clients/` — client work, `clients/<client>/<project>/`
- `template/` — the project template; scaffold with `scripts/scaffold-project.sh`
- `docs/` — workspace ADRs + `PLAYBOOK.md` (naming policy, move checklist, planning discipline)
- `_inbox/` — unsorted holding pen; nothing in here is authoritative

## Rules that apply everywhere
- **Migrate on commitment**: a project lives here only if finished or being
  finished. Undecided work stays outside (`~/0/`). BidScovery/RFQ Hunter lives
  at `~/0/bidscovery` and is hands-off: never propose moving or renaming it.
- **Naming** (ADR-002 §4): folder = repo = permanent kebab-case codename.
  Display name lives ONLY in `project.yaml`. Renames touch the manifest, never
  the filesystem.
- **Two authorities per project**: `docs/STATUS.md` (what is shipped) and
  `docs/DECISIONS.md` (what is locked + open TBDs). Code is ground truth; docs
  reconcile to code, never the reverse.
- **Branch-by-default → PR to main. Merged ≠ shipped**: after a merge, verify
  the production deploy reflects main HEAD before reporting done.
- **Plans are files**: `docs/plans/` in the project. Build from the file, not
  from chat memory.
- Never fabricate facts, stats, or client results. Flag uncertainty instead.

## Voice (marketing and copy work)
- Plain English. Short sentences. The reader is a busy owner.
- First person singular ("I"). Operations-literate, no hype.
- Banned words: leverage, seamless, game-changer, unlock, empower, robust,
  synergy, deep dive. (Owner extends this list over time.)

## How Brian works
- GUI chat (Claude Code desktop app / Cowork) over raw terminal.
- Present options + a recommendation before locking a process into a doc.
- Weeks-long gaps between sessions are normal: keep STATUS.md and
  DECISIONS.md current enough to cold-start from.
```

- [ ] **Step 3: Write `README.md`** — exactly:

```markdown
# Ridgeline Workspace

The umbrella for RidgelineKnows.com and every committed project. Governed by
`docs/decisions/ADR-002-WORKSPACE_AND_PROJECT_SYSTEM.md`; day-to-day
procedures in `docs/PLAYBOOK.md`.

| Folder | What it is | Git |
|---|---|---|
| `core/` | The Ridgeline app (marketing + dashboard + portal) | own repo: `ridgeline-core` |
| `projects/` | Products & portfolio pieces | one repo per folder |
| `clients/` | Client work (`clients/<client>/<project>/`) | one repo per project |
| `template/` | Project template v2 | this repo |
| `scripts/` | Scaffolder, snapshot, PR-notes tools | this repo |
| `docs/` | ADRs + PLAYBOOK | this repo |
| `_inbox/` | Unsorted holding pen — empty it consciously | untracked |

New project: `scripts/scaffold-project.sh <codename> [--client <slug>] [--display "Name"]`
```

- [ ] **Step 4: Write `.gitignore`** — exactly:

```gitignore
# Child repos — each is its own git repository
/core/
/projects/
/clients/

# Holding pen — unsorted, not a record
/_inbox/

# OS noise
.DS_Store
Thumbs.db
*.log
```

- [ ] **Step 5: Write `docs/PLAYBOOK.md`** — exactly:

```markdown
# Ridgeline Playbook

Operational procedures for the workspace. Decisions live in the ADRs; this is
the how-to. Last Updated: 2026-07-03

## Naming policy (ADR-002 §4)
- Folder = repo = permanent kebab-case codename. Never renamed, period.
- Display/brand name lives in ONE place: `project.yaml` → `display_name`.
- A product rename = edit the manifest + marketing copy. Folders, repos,
  skills, and database names never move.

## Scaffolding a new project
1. `scripts/scaffold-project.sh <codename>` — personal/portfolio work, lands in `projects/`.
2. `scripts/scaffold-project.sh <codename> --client <client-slug>` — lands in `clients/<client-slug>/`.
3. Create the remote when ready: `gh repo create devegg/<codename> --private --source projects/<codename> --push`.
4. Fill in CLAUDE.md's first line, project.yaml's description, and README.

## Moving an existing project in (the move checklist)
Run in order; do not skip steps.
1. Clean `git status`, everything pushed (the remote is the escape hatch).
2. If the GitHub repo name is not the kebab codename, rename it FIRST, from
   inside the repo: `gh repo rename <codename> --yes` (GitHub auto-redirects;
   verify with `git remote -v` + `git fetch`).
3. `mv ~/0/<Folder> ~/0/ridgeline/projects/<codename>`
4. Move the Claude Code brain (history + per-project memory):
   `mv ~/.claude/projects/-Users-brianboyd-0-<Folder> ~/.claude/projects/-Users-brianboyd-0-ridgeline-projects-<codename>`
   (dashes replace slashes; the new name = the new absolute path transformed).
5. Grep for absolute paths and fix:
   `grep -rn "/Users/brianboyd" <dest> --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next`
6. Retrofit template v2: add `project.yaml`, `docs/STATUS.md`, `docs/DECISIONS.md`,
   `.claude/settings.json` + `.claude/hooks/session-start.sh`, `scripts/drift-scan.sh`
   (copy from `template/`, replace `{{TOKENS}}` by hand). Keep the project's
   existing CLAUDE.md/AGENTS.md — add, don't rewrite.
7. Commit + push the retrofit; run the project (`npm run build` or dev) to smoke-test.
8. Open a Claude session in the new path (hook should greet you); register the
   project in the core app's Projects section.

## Planning discipline (ADR-002 §6)
- Planning runs as its own Claude session WITH file access (desktop app /
  Cowork), in parallel with the build session.
- Collision rule: the planning session writes only under `docs/`; the build
  session owns code. Both writing code → build session takes a worktree.
- Before a planning session: reconcile docs to code (STATUS/DECISIONS current,
  `node scripts/gen-pr-notes.mjs` re-run). Plans land in `docs/plans/`.
- Away-from-machine fallback: `scripts/snapshot.sh <project>` → upload the
  file from `<project>/docs/gitignored/snapshots/` to the claude.ai Project.

## The junk rule
`_inbox/` is a holding pen, not storage. When it grows past ~a dozen items,
triage: promote to a project, file into a project's docs, or delete.
```

### Task 5: Relocate workspace-level docs out of core

**Files:**
- Move: `core/docs/decisions/ADR-001-PROJECT_STRUCTURE.md`, `core/docs/decisions/ADR-002-WORKSPACE_AND_PROJECT_SYSTEM.md` → workspace `docs/decisions/`
- Move: `core/docs/plans/BUILD-PLAN-workspace-phases-0-3.md` (this plan) → workspace `docs/plans/`
- Create: `core/docs/decisions/MOVED.md`

- [ ] **Step 1: Copy to the workspace, remove from core, leave a stub**

```bash
cp /Users/brianboyd/0/ridgeline/core/docs/decisions/ADR-001-PROJECT_STRUCTURE.md /Users/brianboyd/0/ridgeline/core/docs/decisions/ADR-002-WORKSPACE_AND_PROJECT_SYSTEM.md /Users/brianboyd/0/ridgeline/docs/decisions/
cp /Users/brianboyd/0/ridgeline/core/docs/plans/BUILD-PLAN-workspace-phases-0-3.md /Users/brianboyd/0/ridgeline/docs/plans/
cd /Users/brianboyd/0/ridgeline/core
git rm -q docs/decisions/ADR-001-PROJECT_STRUCTURE.md docs/decisions/ADR-002-WORKSPACE_AND_PROJECT_SYSTEM.md docs/plans/BUILD-PLAN-workspace-phases-0-3.md
cat > docs/decisions/MOVED.md << 'EOF'
# Moved

Workspace-level ADRs (ADR-001 project structure, ADR-002 workspace system) and
workspace build plans now live in the workspace repo one level up:
`../../docs/decisions/` and `../../docs/plans/`. Core-app-specific ADRs will
start at ADR-100 here to avoid number collisions.
EOF
git add docs/decisions/MOVED.md
git commit -m "docs: relocate workspace-level ADRs and plan to the workspace repo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin master
```
Expected: core clean after push; ADRs + plan present under workspace `docs/`.

### Task 6: Sweep the loose files into `_inbox/` + seed scripts

**Files:**
- Move into `_inbox/`: `~/0/App-ideas.md`, `~/0/App-ideas-2.md`, `~/0/Ryan.md`, `~/0/Ryan.pdf`, `~/0/RIDGELINE_ROLE_CAPABILITIES.md`, `~/0/lifecycle-timeline-outline.md`, `~/0/scaffold-project.sh` (superseded root copy)
- Copy: `~/0/scripts/combine-files.cjs` → workspace `scripts/combine-files.cjs`

- [ ] **Step 1: Sweep files (folders stay put — undecided zone)**

```bash
cd /Users/brianboyd/0
mv App-ideas.md App-ideas-2.md Ryan.md Ryan.pdf RIDGELINE_ROLE_CAPABILITIES.md lifecycle-timeline-outline.md scaffold-project.sh /Users/brianboyd/0/ridgeline/_inbox/
cp /Users/brianboyd/0/scripts/combine-files.cjs /Users/brianboyd/0/ridgeline/scripts/
ls /Users/brianboyd/0
```
Expected: `~/0/` now contains only folders (+ `.claude`, `.DS_Store`).

### Task 7: Init the workspace repo + GitHub

- [ ] **Step 1: Verify gh is authenticated**

```bash
gh auth status
```
Expected: logged in as `devegg`. If not: STOP — owner runs `gh auth login`.

- [ ] **Step 2: Init, commit, create private remote, push**

```bash
cd /Users/brianboyd/0/ridgeline
git init -b main
git add CLAUDE.md README.md .gitignore docs scripts
git commit -m "feat: Ridgeline workspace — master CLAUDE.md, playbook, ADRs, scripts seed

Workspace umbrella per ADR-002: core/, projects/, clients/ are gitignored
child repos; this repo tracks the master memory, playbook, decisions, and
workspace tooling.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
gh repo create devegg/ridgeline-workspace --private --source . --push
git log --oneline -1 && gh repo view devegg/ridgeline-workspace --json name,visibility -q '.name + " " + .visibility'
```
Expected: one commit pushed; `ridgeline-workspace PRIVATE`.

### Task 8: Restore Supabase + core smoke test ⛔ CHECKPOINT after this task

- [ ] **Step 1: Restore the paused Supabase project**

Via Supabase MCP: call `restore_project` with `project_id: eizoelivnnuukskorrgy` (RidgelineKnows). Then poll `get_project` until `status: ACTIVE_HEALTHY` (can take a few minutes).

- [ ] **Step 2: Run core from its new path**

```bash
cd /Users/brianboyd/0/ridgeline/core && npm run dev &
sleep 8 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ ; kill %1
```
Expected: `200`. (Login flow needs the restored Supabase; homepage render proves the path move broke nothing.)

**⛔ CHECKPOINT: workspace shell exists, core verified. Owner reviews master CLAUDE.md + PLAYBOOK wording. Get go for Phase 2.**

---

## PHASE 2 — Template v2 + scaffolder v2

### Task 9: Template static files

**Files:** Create under `/Users/brianboyd/0/ridgeline/template/`: `README.md`, `BACKLOG.md`, `project.yaml`, `.gitignore`, `.env.example`, `docs/STATUS.md`, `docs/DECISIONS.md`, plus empty dirs `docs/plans/`, `docs/research/`, `docs/portfolio/`, `docs/gitignored/snapshots/`, `scripts/` (each empty dir gets `.gitkeep`).

Note: `{{CODENAME}}`, `{{DISPLAY_NAME}}`, `{{CLIENT}}`, `{{DATE}}` are scaffolder substitution tokens — intentional.

- [ ] **Step 1: Dirs**

```bash
mkdir -p /Users/brianboyd/0/ridgeline/template/{docs/plans,docs/research,docs/portfolio,docs/gitignored/snapshots,scripts,.claude/hooks}
touch /Users/brianboyd/0/ridgeline/template/docs/{plans,research,portfolio}/.gitkeep /Users/brianboyd/0/ridgeline/template/docs/gitignored/snapshots/.gitkeep
```

- [ ] **Step 2: `template/project.yaml`** — exactly:

```yaml
# Project manifest — the single source of truth for identity (ADR-002 §4).
codename: {{CODENAME}}            # = folder = repo name. PERMANENT.
display_name: "{{DISPLAY_NAME}}"  # the ONLY place the brand name lives
client: {{CLIENT}}                # self | client slug
status: active                    # active | paused | finished | archived
description: ""
portfolio: false                  # true → shown on ridgelineknows.com /work
ridgeline_project_id: ""          # record id in the core app's Projects table
created: {{DATE}}
```

- [ ] **Step 3: `template/docs/STATUS.md`** — exactly:

```markdown
# {{DISPLAY_NAME}} — Build Status
Last Updated: {{DATE}}

> Status authority (ADR-002 §3): what is ACTUALLY shipped. Code is ground
> truth; this file reconciles to code. Update in the same session as any
> merge or migration.

## Shipped
| Area | Status | Notes |
|---|---|---|
| — | scaffolded | project created {{DATE}} |

## Known gaps
- none recorded yet

## Release log (terse — full PR bodies in PR-NOTES.md)
| Date | PR | One-liner |
|---|---|---|
```

- [ ] **Step 4: `template/docs/DECISIONS.md`** — exactly:

```markdown
# {{DISPLAY_NAME}} — Decisions Log & Open Items
Last Updated: {{DATE}}

> Decisions authority (ADR-002 §3): locked D# decisions override contrary
> notes anywhere else. Strike open items the day they resolve.

## Locked decisions
| # | Date | Decision | Overrides |
|---|---|---|---|
| D1 | {{DATE}} | Scaffolded from ridgeline template v2; naming per ADR-002 §4 (codename `{{CODENAME}}` permanent) | — |

## Open items (TBD register)
- none
```

- [ ] **Step 5: `template/README.md`** — exactly:

```markdown
# {{DISPLAY_NAME}}

One-paragraph description. (`project.yaml` is the manifest; this file is the
human intro.)

## Run
- `npm run dev` — edit to match the stack

## Where things are
- `docs/STATUS.md` — what is actually shipped (status authority)
- `docs/DECISIONS.md` — locked decisions + open items (decisions authority)
- `docs/plans/` — build plans; `docs/portfolio/` — case study / white paper
- `scripts/drift-scan.sh` — doc-rot check
```

- [ ] **Step 6: `template/BACKLOG.md`** — exactly:

```markdown
# {{DISPLAY_NAME}} — Backlog

Agreed-but-unscheduled items. Order does not imply build order. Move an item
to a plan in `docs/plans/` when it gets scheduled.

- [ ] (first item)
```

- [ ] **Step 7: `template/.gitignore`** — exactly:

```gitignore
# Secrets
.env
.env.local
.env.*.local

# Node
node_modules/
.next/
dist/
build/
out/
coverage/
*.log

# Python
__pycache__/
*.py[cod]
.venv/
venv/

# Local-only reference
/docs/gitignored/

# OS / editor
.DS_Store
Thumbs.db
.vscode/
.idea/
```

- [ ] **Step 8: `template/.env.example`** — exactly:

```bash
# Copy to .env.local and fill in. Never commit real values.
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Task 10: Template CLAUDE.md + .claude (hook + settings)

**Files:** Create `template/CLAUDE.md`, `template/.claude/settings.json`, `template/.claude/hooks/session-start.sh`

- [ ] **Step 1: `template/CLAUDE.md`** — exactly:

```markdown
# {{DISPLAY_NAME}} — project memory

REPLACE THIS LINE with one sentence: what this project is.

## Start here, every session
1. Read `docs/STATUS.md` (what is shipped) and `docs/DECISIONS.md` (what is
   locked + open TBDs).
2. Plans live in `docs/plans/` — build from the file, not chat memory.

## Rules
- Inherits the workspace master CLAUDE.md one level up (naming policy,
  branch-by-default → PR to main, merged ≠ shipped: verify the deploy).
- Update STATUS.md in the same session as any merge or migration. Record
  decisions as D# rows in DECISIONS.md.
- Run `scripts/drift-scan.sh` before calling the docs current.
- After merging PRs: `node scripts/gen-pr-notes.mjs` regenerates
  `docs/PR-NOTES.md` (never hand-edit it).

## How to run
- `npm run dev` — EDIT to match the stack.

## Gotchas
- None yet. Add one every time something surprises you.
```

- [ ] **Step 2: `template/.claude/settings.json`** — exactly:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: `template/.claude/hooks/session-start.sh`** — exactly:

```bash
#!/usr/bin/env bash
# SessionStart: orient the session. Non-blocking (mirrors CLAUDE.md "Start here").
echo "{{DISPLAY_NAME}} — before new work: read docs/STATUS.md (status authority) + docs/DECISIONS.md (decisions authority). Plans: docs/plans/. Doc-rot check: scripts/drift-scan.sh."
exit 0
```

```bash
chmod +x /Users/brianboyd/0/ridgeline/template/.claude/hooks/session-start.sh
```

### Task 11: `template/scripts/drift-scan.sh`

**Files:** Create `template/scripts/drift-scan.sh` (verified in Task 13's test scaffold)

- [ ] **Step 1: Write the script** — exactly:

```bash
#!/usr/bin/env bash
# drift-scan.sh — mechanical doc-rot scan (template v2, slimmed from BidScovery).
# Run from the project root: scripts/drift-scan.sh
# Flags are prompts to verify, not verdicts. Semantic drift still needs a human/agent read.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
echo "=== drift-scan: $(basename "$PWD") — $(date +%F) ==="

# 1. Newest migration reflected in STATUS?
if compgen -G "supabase/migrations/*.sql" > /dev/null; then
  newest=$(ls supabase/migrations/*.sql | sort | tail -1)
  echo "-- newest migration: $(basename "$newest")"
  stamp=$(basename "$newest" | cut -d_ -f1)
  grep -q "$stamp" docs/STATUS.md 2>/dev/null || echo "   FLAG: not mentioned in docs/STATUS.md"
fi

# 2. Open TBD markers
echo "-- open [TBD markers:"
grep -rn "\[TBD" docs/ ./*.md 2>/dev/null | grep -v gitignored || echo "   none"

# 3. Authority docs freshness vs last commit
last_commit=$(git log -1 --format=%cs 2>/dev/null || echo "")
for f in docs/STATUS.md docs/DECISIONS.md; do
  if [ ! -f "$f" ]; then echo "-- FLAG: missing $f"; continue; fi
  lu=$(grep -im1 "last updated" "$f" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || true)
  echo "-- $f Last-Updated: ${lu:-none} (last commit: ${last_commit:-none})"
  if [ -n "$lu" ] && [ -n "$last_commit" ] && [[ "$lu" < "$last_commit" ]]; then
    echo "   FLAG: doc older than latest commit"
  fi
done

# 4. Next.js routes with no STATUS mention
for approot in app src/app web/app; do
  [ -d "$approot" ] || continue
  echo "-- routes in $approot/ missing from docs/STATUS.md:"
  missing=0
  while IFS= read -r p; do
    route=$(dirname "${p#"$approot"}")
    [ "$route" = "/" ] && continue
    grep -q -- "$route" docs/STATUS.md 2>/dev/null || { echo "   FLAG: $route"; missing=1; }
  done < <(find "$approot" -name page.tsx -not -path "*node_modules*" 2>/dev/null)
  [ "$missing" -eq 0 ] && echo "   none"
done

# 5. Stale-signal phrases in docs
echo "-- stale-signal phrases (verify each is still true):"
grep -rniE "not yet (wired|built|ingested)|coming soon|placeholder|mock(ed)? data" docs/ 2>/dev/null | grep -v gitignored || echo "   none"
echo "=== end drift-scan ==="
```

```bash
chmod +x /Users/brianboyd/0/ridgeline/template/scripts/drift-scan.sh
```

### Task 12: Workspace scripts — `gen-pr-notes.mjs` (into template) + `snapshot.sh`

**Files:**
- Create: `template/scripts/gen-pr-notes.mjs` (ships with every project)
- Create: workspace `scripts/snapshot.sh`

**Interfaces:**
- Produces: `docs/PR-NOTES.md` in any project (consumed by snapshot.sh and planning sessions)
- `snapshot.sh <project-path>` → `<project>/docs/gitignored/snapshots/<name>-combined-YYYY-MM-DD[x].txt` (via `combine-files.cjs`, which writes `<folder-name>-combined-<date>.txt` into the target folder)

- [ ] **Step 1: `template/scripts/gen-pr-notes.mjs`** — exactly (generalized from BidScovery's, zero-PR-safe):

```javascript
#!/usr/bin/env node
// gen-pr-notes.mjs — regenerate docs/PR-NOTES.md from the merged-PR history on GitHub.
//   node scripts/gen-pr-notes.mjs      (run from the project root; needs an authed `gh`)
// GENERATED — do not hand-edit docs/PR-NOTES.md. Re-run after merging a PR.
// Reading GitHub (the source of truth) means it can never silently drift.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "PR-NOTES.md");

let prs = [];
try {
  const raw = execFileSync(
    "gh",
    ["pr", "list", "--state", "merged", "--limit", "1000", "--json", "number,title,body,mergedAt,mergeCommit"],
    { encoding: "utf8", cwd: ROOT, maxBuffer: 128 * 1024 * 1024 },
  );
  prs = JSON.parse(raw).sort((a, b) => b.number - a.number);
} catch {
  console.error("gh pr list failed — is `gh` authed and is this folder a GitHub repo?");
  process.exit(1);
}

const cleanBody = (body) =>
  (body || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n*🤖 Generated with \[Claude Code\]\([^)]*\)\s*$/i, "")
    .trim() || "_(no description)_";

const range = prs.length
  ? `${prs.length} merged PRs (#${prs[prs.length - 1].number}–#${prs[0].number})`
  : "0 merged PRs";

const header = [
  "# PR Notes — full history",
  "",
  "> **GENERATED — do not hand-edit.** Regenerate: `node scripts/gen-pr-notes.mjs`",
  "> (authed `gh`). Full body of every merged PR, newest first. The terse",
  "> one-line-per-PR log lives in docs/STATUS.md's Release log.",
  "",
  `_Generated ${new Date().toISOString().slice(0, 10)} from ${range}._`,
  "",
  "---",
  "",
].join("\n");

const body = prs
  .map((pr) => {
    const date = (pr.mergedAt || "").slice(0, 10);
    const sha = (pr.mergeCommit?.oid || "").slice(0, 7);
    const meta = [date && `merged ${date}`, sha && `\`${sha}\``].filter(Boolean).join(" · ");
    return `## #${pr.number} — ${pr.title}\n${meta ? meta + "\n" : ""}\n${cleanBody(pr.body)}\n`;
  })
  .join("\n---\n\n");

writeFileSync(OUT, header + (body || "_No merged PRs yet._") + "\n");
console.log(`PR-NOTES.md — ${range} → ${path.relative(ROOT, OUT)}`);
```

- [ ] **Step 2: workspace `scripts/snapshot.sh`** — exactly:

```bash
#!/usr/bin/env bash
# snapshot.sh — away-from-machine fallback (ADR-002 §6): one scrubbed combined
# file for upload to a claude.ai Project.
#   scripts/snapshot.sh <project-path>
# Sequence discipline: run ONLY after docs reconcile to code.
set -euo pipefail
WS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJ_ARG="${1:?usage: snapshot.sh <project-path>}"
PROJ="$(cd "$PROJ_ARG" && pwd)"

echo "Reminder (ADR-002 §6): snapshot only AFTER STATUS/DECISIONS are current."
if [ -f "$PROJ/scripts/gen-pr-notes.mjs" ] && git -C "$PROJ" remote get-url origin > /dev/null 2>&1; then
  (cd "$PROJ" && node scripts/gen-pr-notes.mjs) || echo "WARN: gen-pr-notes failed — snapshot continues without a PR-NOTES refresh"
fi

node "$WS/scripts/combine-files.cjs" "$PROJ"
mkdir -p "$PROJ/docs/gitignored/snapshots"
mv "$PROJ"/*-combined-*.txt "$PROJ/docs/gitignored/snapshots/" 2>/dev/null || true
echo "Snapshots (newest first):"
ls -t "$PROJ/docs/gitignored/snapshots" | head -3
```

```bash
chmod +x /Users/brianboyd/0/ridgeline/scripts/snapshot.sh
```

### Task 13: `scripts/scaffold-project.sh` v2 + test scaffold

**Files:**
- Create: workspace `scripts/scaffold-project.sh` (replaces the ADR-001 version; keeps the `TARGET_DIR` env contract the core action uses)
- Test: scaffold into the scratchpad, verify, delete

**Interfaces:**
- Consumes: `template/` (Tasks 9–12), tokens `{{CODENAME}} {{DISPLAY_NAME}} {{CLIENT}} {{DATE}}`
- Produces: CLI `scaffold-project.sh <codename> [--client <slug>] [--display "Name"]`; env override `TARGET_DIR=<abs-path>` (used by core's server action) — destination is always `<root>/<codename>`

- [ ] **Step 1: Write the script** — exactly:

```bash
#!/usr/bin/env bash
# scaffold-project.sh v2 — create a project from template/ (ADR-002).
#   scripts/scaffold-project.sh <codename> [--client <client-slug>] [--display "Display Name"]
# Destination: projects/<codename>, or clients/<client-slug>/<codename> with
# --client, or $TARGET_DIR/<codename> if TARGET_DIR is set (core app contract).
set -euo pipefail
WS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$WS/template"

CODENAME="${1:-}"
[ -n "$CODENAME" ] && shift
CLIENT=""
DISPLAY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --client)  CLIENT="$2";  shift 2 ;;
    --display) DISPLAY="$2"; shift 2 ;;
    *) echo "unknown argument: $1"; exit 1 ;;
  esac
done

if ! [[ "$CODENAME" =~ ^[a-z0-9][a-z0-9-]{1,79}$ ]]; then
  echo "usage: scaffold-project.sh <codename> [--client <slug>] [--display \"Name\"]"
  echo "codename must be kebab-case: lowercase letters, digits, hyphens (2–80 chars). PERMANENT (ADR-002 §4)."
  exit 1
fi
DISPLAY="${DISPLAY:-$CODENAME}"

if [ -n "${TARGET_DIR:-}" ]; then DEST_ROOT="$TARGET_DIR"
elif [ -n "$CLIENT" ];        then DEST_ROOT="$WS/clients/$CLIENT"
else                               DEST_ROOT="$WS/projects"
fi
DEST="$DEST_ROOT/$CODENAME"
[ -e "$DEST" ] && { echo "ERROR: $DEST already exists"; exit 1; }

mkdir -p "$DEST_ROOT"
cp -R "$TEMPLATE" "$DEST"
TODAY="$(date +%F)"

LC_ALL=C find "$DEST" -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.sh" -o -name "*.example" \) -print0 |
  xargs -0 sed -i '' \
    -e "s|{{CODENAME}}|$CODENAME|g" \
    -e "s|{{DISPLAY_NAME}}|$DISPLAY|g" \
    -e "s|{{CLIENT}}|${CLIENT:-self}|g" \
    -e "s|{{DATE}}|$TODAY|g"

chmod +x "$DEST/.claude/hooks/session-start.sh" "$DEST/scripts/drift-scan.sh"
git -C "$DEST" init -q -b main
git -C "$DEST" add -A
git -C "$DEST" commit -q -m "chore: scaffold $CODENAME from ridgeline template v2"

echo "OK: $DEST  (display: \"$DISPLAY\", client: ${CLIENT:-self})"
echo "next: gh repo create devegg/$CODENAME --private --source \"$DEST\" --push"
```

```bash
chmod +x /Users/brianboyd/0/ridgeline/scripts/scaffold-project.sh
```

- [ ] **Step 2: Test — scaffold into the scratchpad**

```bash
TARGET_DIR=/private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad /Users/brianboyd/0/ridgeline/scripts/scaffold-project.sh zz-test-project --display "ZZ Test"
```
Expected: `OK: .../scratchpad/zz-test-project (display: "ZZ Test", client: self)`.

- [ ] **Step 3: Verify tokens, git, and drift-scan inside the test scaffold**

```bash
cd /private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad/zz-test-project
grep -rn "{{" . --exclude-dir=.git && echo "FAIL: unreplaced tokens" || echo "tokens OK"
head -1 project.yaml docs/STATUS.md
git log --oneline
bash scripts/drift-scan.sh
```
Expected: `tokens OK`; STATUS shows `# ZZ Test — Build Status`; one scaffold commit; drift-scan runs end-to-end printing `none` for TBDs and no missing-authority flags.

- [ ] **Step 4: Verify the error paths**

```bash
/Users/brianboyd/0/ridgeline/scripts/scaffold-project.sh "Bad Name" ; echo "exit=$?"
TARGET_DIR=/private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad /Users/brianboyd/0/ridgeline/scripts/scaffold-project.sh zz-test-project ; echo "exit=$?"
```
Expected: kebab-case usage error then `exit=1`; "already exists" error then `exit=1`.

- [ ] **Step 5: Clean up + commit workspace**

```bash
rm -rf /private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad/zz-test-project
cd /Users/brianboyd/0/ridgeline
git add template scripts
git commit -m "feat: project template v2 + scaffolder v2 (ADR-002 §3–4)

Template: manifest, STATUS/DECISIONS authorities, CLAUDE.md, session-start
hook, drift-scan, gen-pr-notes. Scaffolder: token substitution, --client
routing, TARGET_DIR contract kept for the core app action.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
```

### Task 14: Point core's scaffolder action at the workspace + retire old template ⛔ CHECKPOINT after this task

**Files:**
- Modify: `core/app/actions/scaffolder.ts:6-8`
- Delete from core: `core/scripts/scaffold-project.sh` (workspace owns it now)
- Move: `~/0/ridgeline-template/` → `_inbox/ridgeline-template-old/`

- [ ] **Step 1: Edit `core/app/actions/scaffolder.ts`**

Replace lines 6–8:
```typescript
const SCRIPT_PATH = path.resolve(process.cwd(), 'scripts/scaffold-project.sh')
// Projects are created as siblings of the ridgeline repo (one level up)
const PROJECTS_ROOT = path.resolve(process.cwd(), '..')
```
with:
```typescript
// Workspace layout (ADR-002): core/ sits one level below the workspace root
const SCRIPT_PATH = path.resolve(process.cwd(), '../scripts/scaffold-project.sh')
// New projects land in the workspace projects/ folder
const PROJECTS_ROOT = path.resolve(process.cwd(), '../projects')
```

- [ ] **Step 2: Remove the superseded script from core; retire ridgeline-template**

```bash
cd /Users/brianboyd/0/ridgeline/core
git rm -q scripts/scaffold-project.sh
mv /Users/brianboyd/0/ridgeline-template /Users/brianboyd/0/ridgeline/_inbox/ridgeline-template-old
```

- [ ] **Step 3: Verify the action end-to-end via the script contract**

```bash
TARGET_DIR=/private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad bash /Users/brianboyd/0/ridgeline/scripts/scaffold-project.sh zz-action-test
ls /private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad/zz-action-test
rm -rf /private/tmp/claude-501/-Users-brianboyd-0-ridgeline/932a57d2-76b9-427d-8d1a-3dd76bef6661/scratchpad/zz-action-test
npx tsc --noEmit -p /Users/brianboyd/0/ridgeline/core/tsconfig.json
```
Expected: scaffold succeeds exactly as the server action will invoke it (bash + TARGET_DIR + codename); tsc clean.

- [ ] **Step 4: Commit + push core**

```bash
cd /Users/brianboyd/0/ridgeline/core
git add -A
git commit -m "feat: scaffolder action targets workspace scripts + projects/ (ADR-002)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin master
```

**⛔ CHECKPOINT: template + scaffolder live. Owner may eyeball a scaffold. Get go for Phase 3.**

---

## PHASE 3 — Pilot migrations

### Task 15: Move MovieSlotMachine (codename `movie-slot-machine`)

- [ ] **Step 1: Preflight**

```bash
cd /Users/brianboyd/0/MovieSlotMachine
git status --porcelain
git log --oneline @{u}.. | wc -l
```
Expected: empty; `0`. If not, commit/push first — STOP and tell the owner.

- [ ] **Step 2: Rename the GitHub repo to the codename (auto-redirects)**

```bash
cd /Users/brianboyd/0/MovieSlotMachine
gh repo rename movie-slot-machine --yes
git remote -v
git fetch origin
```
Expected: remote now `github.com/devegg/movie-slot-machine.git`; fetch succeeds. (Vercel binds the repo by ID — verify after the move via Vercel MCP `get_project` for `movie-slot-machine`, expect it still linked.)

- [ ] **Step 3: Move the folder + the Claude Code brain**

```bash
mv /Users/brianboyd/0/MovieSlotMachine /Users/brianboyd/0/ridgeline/projects/movie-slot-machine
mv /Users/brianboyd/.claude/projects/-Users-brianboyd-0-MovieSlotMachine /Users/brianboyd/.claude/projects/-Users-brianboyd-0-ridgeline-projects-movie-slot-machine
```
(If the second `mv` says "No such file", the history dir name differs — `ls /Users/brianboyd/.claude/projects/ | grep -i movieslot` and move the correctly-spelled dir. Leave the `-Machibe` typo dir alone.)

- [ ] **Step 4: Absolute-path check (verified clean pre-plan; re-confirm)**

```bash
grep -rn "/Users/brianboyd" /Users/brianboyd/0/ridgeline/projects/movie-slot-machine --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next || echo "clean"
```
Expected: `clean`.

### Task 16: Retrofit MovieSlotMachine + smoke test

**Files:** Create in `projects/movie-slot-machine/`: `project.yaml`, `docs/STATUS.md`, `docs/DECISIONS.md`, `.claude/settings.json`, `.claude/hooks/session-start.sh`, `scripts/drift-scan.sh`, `scripts/gen-pr-notes.mjs`, dirs `docs/{plans,research,portfolio,gitignored/snapshots}`. Existing `CLAUDE.md`/`AGENTS.md`/`.claude/settings.local.json` are kept untouched.

- [ ] **Step 1: Copy template pieces + hand-substitute tokens**

```bash
P=/Users/brianboyd/0/ridgeline/projects/movie-slot-machine
T=/Users/brianboyd/0/ridgeline/template
mkdir -p "$P"/docs/{plans,research,portfolio,gitignored/snapshots} "$P/.claude/hooks" "$P/scripts"
cp "$T/project.yaml" "$P/project.yaml"
cp "$T/docs/STATUS.md" "$P/docs/STATUS.md"
cp "$T/docs/DECISIONS.md" "$P/docs/DECISIONS.md"
cp "$T/.claude/settings.json" "$P/.claude/settings.json"
cp "$T/.claude/hooks/session-start.sh" "$P/.claude/hooks/session-start.sh"
cp "$T/scripts/drift-scan.sh" "$P/scripts/drift-scan.sh"
cp "$T/scripts/gen-pr-notes.mjs" "$P/scripts/gen-pr-notes.mjs"
chmod +x "$P/.claude/hooks/session-start.sh" "$P/scripts/drift-scan.sh"
for f in "$P/project.yaml" "$P/docs/STATUS.md" "$P/docs/DECISIONS.md" "$P/.claude/hooks/session-start.sh"; do
  sed -i '' \
    -e "s|{{CODENAME}}|movie-slot-machine|g" \
    -e "s|{{DISPLAY_NAME}}|Movie Slot Machine|g" \
    -e "s|{{CLIENT}}|self|g" \
    -e "s|{{DATE}}|$(date +%F)|g" "$f"
done
grep -rn "{{" "$P/project.yaml" "$P/docs/STATUS.md" "$P/docs/DECISIONS.md" "$P/.claude/hooks/session-start.sh" && echo "FAIL: tokens remain" || echo "tokens OK"
```
Expected: `tokens OK`. (`settings.json`, `drift-scan.sh`, `gen-pr-notes.mjs` carry no tokens.)

- [ ] **Step 2: Pilot-specific manifest and decision edits**

In `project.yaml` set: `portfolio: true`, `description: "Slot-machine style movie picker."`, and `status:` per owner call at the checkpoint (`active` or `finished`). Append to `docs/DECISIONS.md` locked table:
```markdown
| D2 | <today> | Migrated into ridgeline workspace (ADR-002); GitHub repo renamed MovieSlotMachine → movie-slot-machine (auto-redirect); codename locked | — |
```
Append to `docs/STATUS.md` Known gaps: `- STATUS backfill pending: fill the Shipped matrix from the app's README/commit history in the first doc-sync session.`

- [ ] **Step 3: Regenerate PR notes (proves gh works post-rename)**

```bash
cd /Users/brianboyd/0/ridgeline/projects/movie-slot-machine && node scripts/gen-pr-notes.mjs
```
Expected: `PR-NOTES.md — N merged PRs … → docs/PR-NOTES.md` (N may be 0 — file still written).

- [ ] **Step 4: Commit, push, build smoke**

```bash
cd /Users/brianboyd/0/ridgeline/projects/movie-slot-machine
git add -A
git commit -m "chore: retrofit ridgeline template v2 — manifest, authorities, hook, drift-scan (ADR-002)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
npm run build
bash scripts/drift-scan.sh
```
Expected: push OK (proves the renamed remote), build succeeds from the new path, drift-scan runs (route FLAGs are expected until the STATUS backfill — that's the tool working).

### Task 17: Move GridStrain (codename `gridstrain`)

- [ ] **Step 1: Preflight**

```bash
cd /Users/brianboyd/0/GridStrain
git status --porcelain
git log --oneline @{u}.. | wc -l
```
Expected: empty; `0`. (Repo is already `devegg/gridstrain` — no rename needed.)

- [ ] **Step 2: Move folder + Claude brain**

```bash
mv /Users/brianboyd/0/GridStrain /Users/brianboyd/0/ridgeline/projects/gridstrain
mv /Users/brianboyd/.claude/projects/-Users-brianboyd-0-GridStrain /Users/brianboyd/.claude/projects/-Users-brianboyd-0-ridgeline-projects-gridstrain
grep -rn "/Users/brianboyd" /Users/brianboyd/0/ridgeline/projects/gridstrain --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next || echo "clean"
```
Expected: `clean`.

### Task 18: Retrofit GridStrain + smoke test ⛔ CHECKPOINT after this task

- [ ] **Step 1: Copy template pieces + substitute tokens**

```bash
P=/Users/brianboyd/0/ridgeline/projects/gridstrain
T=/Users/brianboyd/0/ridgeline/template
mkdir -p "$P"/docs/{plans,research,portfolio,gitignored/snapshots} "$P/.claude/hooks" "$P/scripts"
cp "$T/project.yaml" "$P/project.yaml"
cp "$T/docs/STATUS.md" "$P/docs/STATUS.md"
cp "$T/docs/DECISIONS.md" "$P/docs/DECISIONS.md"
cp "$T/.claude/settings.json" "$P/.claude/settings.json"
cp "$T/.claude/hooks/session-start.sh" "$P/.claude/hooks/session-start.sh"
cp "$T/scripts/drift-scan.sh" "$P/scripts/drift-scan.sh"
cp "$T/scripts/gen-pr-notes.mjs" "$P/scripts/gen-pr-notes.mjs"
chmod +x "$P/.claude/hooks/session-start.sh" "$P/scripts/drift-scan.sh"
for f in "$P/project.yaml" "$P/docs/STATUS.md" "$P/docs/DECISIONS.md" "$P/.claude/hooks/session-start.sh"; do
  sed -i '' \
    -e "s|{{CODENAME}}|gridstrain|g" \
    -e "s|{{DISPLAY_NAME}}|GridStrain|g" \
    -e "s|{{CLIENT}}|self|g" \
    -e "s|{{DATE}}|$(date +%F)|g" "$f"
done
grep -rn "{{" "$P/project.yaml" "$P/docs/STATUS.md" "$P/docs/DECISIONS.md" "$P/.claude/hooks/session-start.sh" && echo "FAIL: tokens remain" || echo "tokens OK"
```
Expected: `tokens OK`. (`settings.json`, `drift-scan.sh`, `gen-pr-notes.mjs` carry no tokens.)

- [ ] **Step 2: Pilot-specific edits**

`project.yaml`: `portfolio: true`, `description: "Power-grid strain monitor."` (owner corrects wording at checkpoint), `status` per owner. `docs/DECISIONS.md` add:
```markdown
| D2 | <today> | Migrated into ridgeline workspace (ADR-002); folder GridStrain → gridstrain matches existing repo devegg/gridstrain; codename locked | — |
```
`docs/STATUS.md` Known gaps: same backfill line as Task 16.

- [ ] **Step 3: PR notes, commit, push, build**

```bash
cd /Users/brianboyd/0/ridgeline/projects/gridstrain
node scripts/gen-pr-notes.mjs
git add -A
git commit -m "chore: retrofit ridgeline template v2 — manifest, authorities, hook, drift-scan (ADR-002)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
npm run build
bash scripts/drift-scan.sh
```
Expected: same as Task 16 Step 4.

- [ ] **Step 4: Vercel link verification for both pilots**

Via Vercel MCP: `get_project` for `movie-slot-machine` and `gridstrain` (team `team_x90zYAAxwCPhLNMaxJC2uvB4`). Expected: both still exist with their linked repos (the rename redirect held; folder moves are invisible to Vercel).

**⛔ CHECKPOINT — Phase 3 review with owner:**
1. Owner opens a Claude session in `projects/movie-slot-machine` — the session-start hook should greet with the STATUS/DECISIONS reminder.
2. Owner sets each pilot's `status:` in project.yaml (active vs finished).
3. Owner registers both projects in the core app's Projects section (core dev server + restored Supabase from Task 8), pasting each record id into `project.yaml → ridgeline_project_id`.
4. Decide the next migration candidate (or stop — migrate-on-commitment).
5. Update `docs/PLAYBOOK.md` move checklist with anything the pilots taught; commit workspace.

---

## Self-review notes (spec coverage)

- ADR-002 §1 shuffle → Task 3; §2 migrate-on-commitment → Global Constraints + Tasks 15/17 only; §3 template incl. folded-in conventions (branch/deploy rules in master CLAUDE.md + template CLAUDE.md, drift-scan Task 11, session-start hook Task 10) → Tasks 9–12; §4 naming → scaffolder validation + PLAYBOOK + pilot renames; §5 master CLAUDE.md → Task 4; §6 planning discipline → PLAYBOOK (Task 4) + snapshot fallback (Task 12); §7 marketing = Phase 5, deliberately absent; Phase 0/1/2/3 sequencing → Tasks 1–2 / 3–8 / 9–14 / 15–18; Supabase INACTIVE finding → Task 8.
- Out of scope, restated: bidscovery untouched; hem/all-these-doors/trades-platform/_Loho/_app/Salem Issue unmoved; `~/0/scripts/` folder unmoved (only combine-files.cjs copied); no marketing routes.
