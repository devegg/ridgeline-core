# ADR-001: Standardized Project Structure

**Status**: Accepted  
**Date**: May 2026  
**Author**: Brian Boyd  

## Context

Ridgeline will develop custom solutions for multiple clients, each with different technical requirements. Previous projects (Salem) created folder structures ad-hoc, leading to inconsistency, confusion about where files belong, and friction when switching between projects.

A standardized structure would:

- Make projects immediately familiar to anyone working on them
- Establish clear conventions for where different types of files live
- Support automation (scaffolding new projects consistently)
- Scale from small prototypes to large applications without reorganization
- Support both public documentation (pushed to GitHub) and local reference materials (not pushed)

## Decision

Adopt a standardized folder structure with the following principles:

1. **Organization by purpose** — Folders group files by function (what they do) rather than by type (what they are)
2. **Public/private separation** — Documentation going to GitHub clearly separated from local references
3. **Scalability** — Works for 1-person projects and large teams without change
4. **Automation-ready** — Simple enough to generate via command-line tool
5. **Flexibility** — Optional folders (extras) don't hurt if unused

## Structure

```
/[project-name]/
├── /app/                    # Application source code
├── /docs/                   # All documentation (public and local)
│   ├── /architecture/       # System design, decisions, tech choices
│   ├── /setup/              # Local development setup
│   ├── /deployment/         # Production, environments, infrastructure
│   ├── /features/           # Feature specs, requirements, acceptance criteria
│   ├── /client/             # Client context, business info, decisions
│   │   └── /migrations/     # Data migration plans (if applicable)
│   ├── /api/                # API documentation (if applicable)
│   ├── /decisions/          # Architecture Decision Records
│   ├── /gitignored/         # Local references (NOT pushed to GitHub)
│   └── /extras/             # Optional: ideas, research, screenshots, etc.
├── /config/                 # Environment and tool configurations
├── /scripts/                # Utility and maintenance scripts
├── .gitignore               # Git exclusion patterns
├── .env.example             # Environment variable template
└── README.md                # Project overview
```

## Rationale

### By Purpose, Not Type

**Why not `/src/`, `/components/`, `/lib/` at root?**

- Those are implementation details (how we build it)
- By-purpose groups things by intent (what they do)
- Easier to navigate: "I need to update the setup guide" → `/docs/setup/`
- Clearer mental model: docs together, code together, config together

### Single `/docs/` Folder

**Why not separate `/docs/` and `/reference/` or `/documentation/`?**

- Single folder groups all project knowledge together
- Subfolder structure provides clarity (public docs vs. gitignored)
- Easier to maintain (one place to look for project info)
- Simple .gitignore rule: exclude only `/docs/gitignored/`

### `/extras/` Inside `/docs/`

**Why not at root level?**

- Keeps root directory cleaner
- Extras are still project documentation/reference
- Clear naming prevents accidental commits (folder name warns it's not public)
- Organized as: all docs in `/docs/`, all code in `/app/`, all config in `/config/`

### `/config/` for Both Environment and Tool Config

**Why not separate `.env` handling?**

- Both are configuration
- Both are in `.env.example` + gitignored `.env`
- Grouped together makes sense: "Where's the config?" → one folder
- Tool configs (tsconfig.json, webpack.config.js, etc.) also live here

### `/scripts/` Not Included in `/app/`

**Why separate?**

- Scripts are utilities (scaffolding, database migrations, backups)
- Application code is different from operational scripts
- Clearer purpose: `/app/` is "what users run", `/scripts/` is "what developers run"
- Allows scripts in various languages (bash, Node, Python) without confusion

## Alternatives Considered

### Alternative 1: `src/`, `tests/`, `docs/` at root
```
/docs/
/tests/
/src/
  /components/
  /pages/
  /utils/
```
**Rejected**: Less clear folder purposes; harder to find things; doesn't scale for different project types.

### Alternative 2: By client + project structure
```
/clients/
  /client-name/
    /project-1/
    /project-2/
```
**Rejected**: Creates too many nesting levels; harder to navigate; each project would still need internal structure.

### Alternative 3: Extras at root level
```
/app/
/docs/
/extras/
/config/
```
**Rejected**: Root directory gets cluttered; extras are still documentation; unclear why extras isn't in docs.

## Implementation

- Create `/scripts/scaffold-project.sh` to generate new projects with this structure
- All new Ridgeline projects use this structure
- Ridgeline itself uses this structure (eats own dog food)
- Structure is enforced by scaffolder — consistency comes free

## Consequences

### Positive
- New projects set up consistently in seconds
- Everyone knows where to find things
- Easy to add automation and tooling
- Scales from tiny to large without friction
- Clear separation of concerns
- Public/private files clearly distinguished

### Negative
- Requires learning the structure once
- Some projects might have special needs (handle case-by-case)
- More folders upfront (even if unused) — minor
- Different from some industry conventions (React apps often use /src/ + /components/) — intentional

## Future Decisions

Related decisions to be made:

- ADR-002: Database schema and migrations strategy
- ADR-003: Authentication and authorization approach
- ADR-004: API design and versioning
- ADR-005: Deployment and CI/CD pipeline

## References

- Salem project — validated this structure in practice
- Project Structure section: `/docs/architecture/PROJECT_STRUCTURE.md`
- Scaffolder documentation: `/docs/architecture/SCAFFOLDER.md`
