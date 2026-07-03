#!/bin/bash

# Project Scaffolder
# Creates a new project with the standard Ridgeline folder structure
# Usage: ./scaffold-project.sh <project-name>
# Example: ./scaffold-project.sh salem-crm

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: scaffold-project.sh <project-name>"
  echo "Example: scaffold-project.sh my-client-project"
  echo ""
  echo "This will create the following structure:"
  echo "  /app/"
  echo "  /docs/ (with subfolders)"
  echo "    /extras/ (ideas, research, screenshots, content, brand, product, portfolio)"
  echo "  /config/"
  echo "  /scripts/"
  exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# OUTPUT_DIR: use TARGET_DIR env var if set (web UI), otherwise use SCRIPT_DIR (CLI)
OUTPUT_DIR="${TARGET_DIR:-$SCRIPT_DIR}"

# Check if project already exists
if [ -d "$OUTPUT_DIR/$PROJECT_NAME" ]; then
  echo "❌ Error: Project '$PROJECT_NAME' already exists at $OUTPUT_DIR/$PROJECT_NAME"
  exit 1
fi

echo "Creating project: $PROJECT_NAME"
echo "Location: $OUTPUT_DIR/$PROJECT_NAME"
echo ""

# Create folder structure
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/app"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/architecture"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/setup"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/deployment"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/features"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/client/migrations"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/api"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/decisions"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/gitignored"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/config"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/scripts"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/ideas"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/research"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/screenshots"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/content"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/brand"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/product"
mkdir -p "$OUTPUT_DIR/$PROJECT_NAME/docs/extras/portfolio"

# Create .gitignore with Node.js and Python patterns
cat > "$OUTPUT_DIR/$PROJECT_NAME/.gitignore" << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Node.js
node_modules/
npm-debug.log
yarn-error.log
package-lock.json
yarn.lock
dist/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
venv/
env/
.venv
.env.venv
.pytest_cache/
.coverage
htmlcov/
build/
*.egg-info/

# IDE/Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
*.iml

# OS
Thumbs.db

# Logs
logs/
*.log

# Documentation (local reference only)
/docs/gitignored/

# Config (local overrides)
/config/*.local.*

# Temporary files
.tmp/
temp/
EOF

# Create .env.example at project root
cat > "$OUTPUT_DIR/$PROJECT_NAME/.env.example" << 'EOF'
# Environment variables template
# Copy to .env and fill in actual values
# Never commit .env to version control

# Example variables (remove/add as needed):
# API_KEY=your_api_key_here
# DATABASE_URL=your_database_url
# NODE_ENV=development
EOF

# Create project root README
cat > "$OUTPUT_DIR/$PROJECT_NAME/README.md" << EOF
# $PROJECT_NAME

Brief description of the project and what it does.

## Quick Start

See [docs/setup/](docs/setup/) for detailed setup instructions.

## Project Structure

- \`/app/\` - Application source code
- \`/docs/\` - Project documentation and references
- \`/config/\` - Environment and tool configurations
- \`/scripts/\` - Utility and maintenance scripts
- \`/extras/\` - Optional reference materials (ideas, research, prototypes, etc.)

## Key Documentation

- [Setup](docs/setup/) - Local development setup
- [Deployment](docs/deployment/) - Production deployment
- [Architecture](docs/architecture/) - System design
- [Features](docs/features/) - Feature specifications
- [Client Info](docs/client/) - Client context and requirements
- [API](docs/api/) - API documentation (if applicable)
- [Decisions](docs/decisions/) - Architecture Decision Records

## Getting Started

1. Update this README with project details
2. Read and follow [docs/setup/](docs/setup/) for environment setup
3. Start building in \`/app/\`
EOF

# Create docs README
cat > "$OUTPUT_DIR/$PROJECT_NAME/docs/README.md" << 'EOF'
# Documentation

## Public Documentation (pushed to GitHub)

- **architecture/** - System design, data flow, tech stack decisions
- **setup/** - Local development environment setup
- **deployment/** - Production deployment, environments, infrastructure
- **features/** - Feature specifications, user stories, acceptance criteria
- **client/** - Client context, business requirements, constraints, project history
  - **migrations/** - Data migration plans and documentation
- **api/** - API endpoints, authentication, data models (if applicable)
- **decisions/** - Architecture Decision Records (ADRs)

## Local References (NOT pushed to GitHub)

See **gitignored/** for:
- Prototypes and mockups
- Research and analysis
- Draft documents
- Temporary working files
- Screenshots and visual references
EOF

# Create config explanation
cat > "$OUTPUT_DIR/$PROJECT_NAME/config/.env.example" << 'EOF'
# Configuration Structure

## Environment-Specific Configs
- .env.development
- .env.staging
- .env.production
- Use these for environment-specific variables (DO NOT commit actual values)

## Tool Configs
- webpack.config.js
- tsconfig.json
- jest.config.js
- .prettierrc
- .eslintrc
- etc.

## Sensitive Data
- All secrets and API keys go in .env (which is gitignored)
- NEVER commit actual credentials
EOF

# Ask about git initialization (skip in non-interactive / web UI mode)
if [ -t 0 ]; then
  echo ""
  read -p "Initialize git repository? (y/n) " -n 1 -r REPLY
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$OUTPUT_DIR/$PROJECT_NAME"
    git init
    git add .
    git commit -m "Initial project scaffold" --no-verify
    echo "✓ Git repository initialized"
    cd "$SCRIPT_DIR"
  fi
else
  echo "(Git init skipped — run manually if needed)"
fi

echo ""
echo "✅ Project scaffolded successfully!"
echo ""
echo "Location: $OUTPUT_DIR/$PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. cd $OUTPUT_DIR/$PROJECT_NAME"
echo "  2. Create docs/setup/README.md with project-specific setup instructions"
echo "  3. Update the root README.md with project details"
echo "  4. Start building in /app/"
echo ""
