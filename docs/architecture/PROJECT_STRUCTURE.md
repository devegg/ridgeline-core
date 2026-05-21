# Project Structure

## Overview

Ridgeline follows a standardized folder structure designed to keep projects organized, scalable, and easy to navigate. This structure serves as both the pattern for Ridgeline itself and the template for all client projects.

## Folder Organization

### `/app/`
Application source code. This is where all production code lives.

- Components, pages, API routes, utilities
- Everything needed to build and run the application
- Language/framework specific (Next.js routes, React components, etc.)

### `/docs/`
All project documentation and reference materials. Organized by purpose.

#### `/architecture/`
System design and technical decisions.

- Data models and relationships
- API design and integration points
- Technology choices and rationale
- System diagrams and flows
- Performance considerations

#### `/setup/`
Getting the project running locally.

- Environment setup instructions
- Dependency installation
- Configuration for development
- Database initialization (if applicable)
- Troubleshooting common issues

#### `/deployment/`
Production deployment and operations.

- Deployment procedures
- Environment configurations (dev, staging, prod)
- Infrastructure setup
- Monitoring and alerting
- Backup and recovery procedures
- CI/CD pipeline configuration

#### `/features/`
Feature specifications and requirements.

- Feature specs with acceptance criteria
- User stories
- Wireframes or mockups
- Edge cases and business rules
- Release notes

#### `/client/`
Client context and business requirements.

- Client background and goals
- Project scope and constraints
- Client-specific requirements
- Communications and decision log
- Known limitations or workarounds

##### `/client/migrations/`
Data migration documentation (if applicable).

- Migration plans and strategy
- Data mapping between old and new systems
- Testing procedures for migrations
- Rollback procedures

#### `/api/`
API documentation (for backend projects).

- Endpoint definitions
- Request/response schemas
- Authentication and authorization
- Error codes and handling
- Rate limiting and quotas

#### `/decisions/`
Architecture Decision Records (ADRs).

- Document significant technical decisions
- Include context, alternatives considered, and rationale
- Named chronologically: `ADR-001-*.md`, `ADR-002-*.md`, etc.

#### `/gitignored/`
Local reference materials NOT pushed to GitHub.

- Prototypes and mockups (experimental work)
- Research and analysis documents
- Draft documentation
- Temporary working files
- Screenshots and UI reference library
- Client data samples or sensitive information
- Large reference files (videos, PDFs, etc.)

**Important:** Everything in this folder is excluded from version control by `.gitignore`

### `/config/`
Environment and tool configuration files.

- Environment-specific configs (`.env.development`, `.env.staging`, `.env.production`)
- Build tool configurations (`webpack.config.js`, `tsconfig.json`, `jest.config.js`)
- Linting and formatting rules (`.prettierrc`, `.eslintrc`)
- Other tool-specific configuration
- `.env` with actual secrets (gitignored) — template is `.env.example`

### `/extras/` (inside `/docs/`)
Optional reference materials for projects that need them.

#### `/ideas/`
Future features, improvements, and brainstorming.

- Feature ideas and enhancements
- Optimization opportunities
- Refactoring candidates
- Product direction discussions

#### `/research/`
Market research, competitive analysis, and domain knowledge.

- Industry research
- Competitor analysis
- User research findings
- Technical research and prototypes
- Third-party API documentation and examples

#### `/screenshots/`
UI reference library.

- Screenshots of desired UI states
- Before/after comparisons
- Design references
- Mobile responsiveness examples
- Known visual issues or edge cases

#### `/content/`
Content and copy documentation.

- Website or app copy
- Help text and microcopy
- Email templates
- Legal documents or terms

#### `/brand/`
Brand guidelines and identity.

- Brand voice and tone guidelines
- Color palettes and usage
- Typography rules
- Logo and visual identity standards
- Brand guidelines documents

#### `/product/`
Product specifications and roadmap.

- Product vision and strategy
- Feature roadmap
- Product requirements documents
- Success metrics and KPIs

#### `/portfolio/`
Case studies and client wins (Ridgeline specific).

- Case study documents (with links back to actual projects)
- Client success stories
- Project outcomes and metrics
- Before/after business impact

## Root Level Files

### `.gitignore`
Excludes files and folders from version control.

- Secrets and environment variables (.env)
- Dependencies (node_modules, venv, etc.)
- Build artifacts (dist, build)
- IDE files (.vscode, .idea)
- OS files (.DS_Store, Thumbs.db)
- `/docs/gitignored/` — local reference materials
- `/config/*.local.*` — local config overrides

### `.env.example`
Template for environment variables.

- Shows what variables the project needs
- Includes examples or placeholder values
- Never includes actual secrets or credentials
- Copy to `.env` and fill in real values for local development

### `README.md`
Project overview at a glance.

- Brief project description
- Quick start instructions (link to `/docs/setup/`)
- Project structure overview
- Links to key documentation

## Design Principles

**Organized by Purpose**: Folders group files by their function (docs, config, scripts) rather than by type.

**Scalability**: The structure supports small prototypes to large applications without requiring reorganization.

**GitHub-Ready**: Clear separation between public documentation (`/docs/`) and local reference materials (`/docs/gitignored/`).

**Reusability**: Same structure across all Ridgeline client projects ensures consistency and familiarity.

**Flexibility**: Optional folders (like `/extras/`) are included by default but used only when needed.

## When to Use Each Folder

| Need | Folder |
|------|--------|
| Write code | `/app/` |
| Document how to run locally | `/docs/setup/` |
| Explain system design | `/docs/architecture/` |
| Record why we made a decision | `/docs/decisions/` |
| Save a screenshot for reference | `/docs/extras/screenshots/` |
| Store API keys or secrets | `/config/.env` (gitignored) |
| Keep old research or drafts | `/docs/gitignored/` |
| Document features | `/docs/features/` |
| Plan future work | `/docs/extras/ideas/` |
