import fs from "fs";
import path from "path";

export interface ScaffolderOptions {
  projectName: string;
  baseDir: string;
  initGit?: boolean;
}

export interface ScaffolderResult {
  success: boolean;
  projectPath: string;
  message: string;
}

const FOLDER_STRUCTURE = {
  app: "app",
  docs: {
    architecture: "docs/architecture",
    setup: "docs/setup",
    deployment: "docs/deployment",
    features: "docs/features",
    client: "docs/client",
    clientMigrations: "docs/client/migrations",
    api: "docs/api",
    decisions: "docs/decisions",
    gitignored: "docs/gitignored",
  },
  config: "config",
  scripts: "scripts",
  extras: {
    ideas: "docs/extras/ideas",
    research: "docs/extras/research",
    screenshots: "docs/extras/screenshots",
    content: "docs/extras/content",
    brand: "docs/extras/brand",
    product: "docs/extras/product",
    portfolio: "docs/extras/portfolio",
  },
};

const GITIGNORE_CONTENT = `# Environment variables
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
`;

const ENV_EXAMPLE_CONTENT = `# Environment variables template
# Copy to .env and fill in actual values
# Never commit .env to version control

# Example variables (remove/add as needed):
# API_KEY=your_api_key_here
# DATABASE_URL=your_database_url
# NODE_ENV=development
`;

const CONFIG_ENV_CONTENT = `# Configuration Structure

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
`;

const getProjectReadme = (projectName: string): string => `# ${projectName}

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
`;

const DOCS_README_CONTENT = `# Documentation

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
`;

async function createFolder(folderPath: string): Promise<void> {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

async function createFolders(baseDir: string): Promise<void> {
  const folders = [
    FOLDER_STRUCTURE.app,
    FOLDER_STRUCTURE.docs.architecture,
    FOLDER_STRUCTURE.docs.setup,
    FOLDER_STRUCTURE.docs.deployment,
    FOLDER_STRUCTURE.docs.features,
    FOLDER_STRUCTURE.docs.clientMigrations,
    FOLDER_STRUCTURE.docs.api,
    FOLDER_STRUCTURE.docs.decisions,
    FOLDER_STRUCTURE.docs.gitignored,
    FOLDER_STRUCTURE.config,
    FOLDER_STRUCTURE.scripts,
    FOLDER_STRUCTURE.extras.ideas,
    FOLDER_STRUCTURE.extras.research,
    FOLDER_STRUCTURE.extras.screenshots,
    FOLDER_STRUCTURE.extras.content,
    FOLDER_STRUCTURE.extras.brand,
    FOLDER_STRUCTURE.extras.product,
    FOLDER_STRUCTURE.extras.portfolio,
  ];

  for (const folder of folders) {
    await createFolder(path.join(baseDir, folder));
  }
}

async function createFiles(baseDir: string, projectName: string): Promise<void> {
  // Create .gitignore
  fs.writeFileSync(path.join(baseDir, ".gitignore"), GITIGNORE_CONTENT);

  // Create .env.example
  fs.writeFileSync(path.join(baseDir, ".env.example"), ENV_EXAMPLE_CONTENT);

  // Create project README
  fs.writeFileSync(
    path.join(baseDir, "README.md"),
    getProjectReadme(projectName)
  );

  // Create docs README
  fs.writeFileSync(path.join(baseDir, "docs/README.md"), DOCS_README_CONTENT);

  // Create config/.env.example
  fs.writeFileSync(
    path.join(baseDir, "config/.env.example"),
    CONFIG_ENV_CONTENT
  );
}

export async function scaffoldProject(
  options: ScaffolderOptions
): Promise<ScaffolderResult> {
  const { projectName, baseDir } = options;
  const projectPath = path.join(baseDir, projectName);

  // Check if project already exists
  if (fs.existsSync(projectPath)) {
    return {
      success: false,
      projectPath,
      message: `Project '${projectName}' already exists at ${projectPath}`,
    };
  }

  try {
    // Create main project folder
    await createFolder(projectPath);

    // Create folder structure
    await createFolders(projectPath);

    // Create files
    await createFiles(projectPath, projectName);

    return {
      success: true,
      projectPath,
      message: `Project '${projectName}' scaffolded successfully at ${projectPath}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      projectPath,
      message: `Failed to scaffold project: ${errorMessage}`,
    };
  }
}
