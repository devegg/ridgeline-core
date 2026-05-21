# Project Scaffolder

The scaffolder is an automated tool for creating new projects with the standardized Ridgeline folder structure. Use it to set up every new client project consistently.

## Current Implementation

### Bash Scaffolder (CLI)

**Location**:

`/scripts/scaffold-project.sh`

**Usage**:

```bash
cd /0/ridgeline
bash scripts/scaffold-project.sh project-name
```

**Example**:

```bash
bash scripts/scaffold-project.sh salem-crm
```

This creates:

```
/0/ridgeline/salem-crm/
├── /app/
├── /docs/
│   ├── /architecture/
│   ├── /setup/
│   ├── /deployment/
│   ├── /features/
│   ├── /client/
│   │   └── /migrations/
│   ├── /api/
│   ├── /decisions/
│   ├── /gitignored/
│   └── /extras/
│       ├── /ideas/
│       ├── /research/
│       ├── /screenshots/
│       ├── /content/
│       ├── /brand/
│       ├── /product/
│       └── /portfolio/
├── /config/
├── /scripts/
├── .gitignore
├── .env.example
└── README.md
```

### What the Scaffolder Does

1. **Creates all folders** — Full folder structure ready to use
2. **Generates starter files**:
   - `.gitignore` — Excludes node_modules, Python venv, .env, `/docs/gitignored/`, etc.
   - `.env.example` — Template showing required environment variables
   - `README.md` — Project overview template (needs customization)
   - `docs/README.md` — Documentation guide
   - `config/.env.example` — Configuration folder explanation
3. **Optionally initializes Git** — Prompts if you want `git init`, stage files, and create initial commit

## Future Implementation

### TypeScript Module

**Location**: 

`/scripts/lib/scaffolder.ts`

A reusable, language-independent module that exports the scaffolding function:

```typescript
export async function scaffoldProject(
  options: ScaffolderOptions
): Promise<ScaffolderResult>
```

**Why**: This module can be imported and called from the Ridgeline web admin page, allowing project creation through the UI instead of the CLI.

### Web Admin Integration

When building the Ridgeline admin dashboard:

1. Create an API endpoint in `/app/api/admin/scaffold/route.ts`
2. Import and call the scaffolder module
3. Admin page submits project name → API creates project → returns success/error

This keeps the same reliable logic but adds a UI layer.

## Workflow

### Creating a New Client Project

```bash
# 1. Run the scaffolder
cd /0/ridgeline
bash scripts/scaffold-project.sh client-name

# 2. Initialize git (say 'y' when prompted)
#    → Creates initial commit with folder structure

# 3. Enter the project folder
cd client-name

# 4. Customize documentation
# Edit README.md with project description
# Create docs/setup/README.md with dev instructions
# Update docs/client/README.md with client info

# 5. Start building
# Add code to /app/
# Add deployment docs to /docs/deployment/
# Create feature specs in /docs/features/
```

## Scaffolder Template Contents

### .gitignore
Includes patterns for:

- **Node.js**: node_modules, npm-debug.log, package-lock.json
- **Python**: __pycache__, venv, *.pyc, .pytest_cache
- **IDE**: .vscode, .idea, *.swp
- **OS**: .DS_Store, Thumbs.db
- **Project**: /docs/gitignored/, /config/*.local.*

### .env.example
Shows structure:

```
# Environment variables template
# Copy to .env and fill in actual values
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
NODE_ENV=development
```

### README.md (Project Root)
Template with:

- Project description placeholder
- Quick start link
- Project structure overview
- Links to key documentation

### docs/README.md
Explains:

- What goes in public docs
- What goes in /docs/gitignored/
- Folder purposes

## When NOT to Use the Scaffolder

- **Monorepos**: If managing multiple related projects in one repo, use the scaffolder as a reference for individual project folders rather than running it
- **Non-standard projects**: Highly unusual projects might need significant structural changes (feel free to customize)
- **Migration work**: When migrating existing projects into the structure, manually organize rather than scaffold (scaffolder creates empty folders)

## Modifying the Scaffolder

To change what gets created:

1. **Bash version**: Edit `/scripts/scaffold-project.sh`
   - Modify folder paths in mkdir commands
   - Update file templates (cat > file syntax)
   - Update usage text

2. **TypeScript module**: Edit `/scripts/lib/scaffolder.ts`
   - Modify `FOLDER_STRUCTURE` constant
   - Update file content strings (GITIGNORE_CONTENT, etc.)
   - Tests will ensure behavior matches bash version

After changes, test on a throwaway project:

```bash
bash scripts/scaffold-project.sh test-project
# ... inspect result
rm -rf test-project
```

## Design Rationale

**Why both bash and TypeScript?**

- Bash works immediately, no build step needed
- TypeScript provides reusable logic for web integration
- Both use identical templates and structure

**Why not a Node.js script?**

- Bash works in any shell environment
- Lower overhead for a one-time setup task
- Easier to understand and modify

**Why interactive git initialization?**

- Gives you control — not all projects start as git repos immediately
- Allows inspection before committing scaffold
- Some projects might integrate into existing repos differently
