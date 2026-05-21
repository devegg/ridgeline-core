# Tech Stack

## Overview

Ridgeline uses a modern, proven full-stack JavaScript setup designed for rapid development, strong type safety, and seamless database integration. This stack was validated on the Salem project and chosen for all Ridgeline work.

## Core Stack

### Frontend & Framework: **Next.js 16**

**What**: React framework with built-in routing, API routes, and optimization.

**Why**:

- Full-stack in one framework (no separate backend needed initially)
- Built-in API routes (/app/api/) for creating endpoints
- Automatic code splitting and optimization
- File-based routing — no route config needed
- Server-side rendering and static generation options
- Great developer experience with hot reload

**Use for**:

- Web UI and pages
- API endpoints
- Authentication flows
- Real-time features

### Language: **TypeScript**

**What**: JavaScript with type checking and compile-time safety.

**Why**:

- Catches errors before runtime (fewer production bugs)
- Excellent IDE support and autocomplete
- Self-documenting code (types describe what data looks like)
- Refactoring confidence — breaking changes caught immediately
- Scales well as projects grow

**Use for**:

- All app code (.tsx, .ts files)
- API routes and server functions
- Database queries
- Utilities and helpers

### Frontend Library: **React 19**

**What**: UI component library (included with Next.js).

**Why**:

- Component-based architecture — reusable, testable pieces
- Large ecosystem of libraries and tools
- Strong community and learning resources
- Efficient rendering with hooks
- Form handling, state management, etc.

**Use for**:

- Page components
- Reusable UI components
- Interactive features
- Real-time updates

### Styling: **Tailwind CSS 4**

**What**: Utility-first CSS framework.

**Why**:

- Write styles inline without context switching
- Consistent design system (colors, spacing, etc. predefined)
- Small CSS bundle (unused styles removed automatically)
- Easy to customize and extend
- Works great with component libraries

**Use for**:

- All styling
- Responsive design
- Dark mode support (built-in)

### UI Components: **shadcn/ui** (optional)

**What**: Reusable, accessible React components built with Tailwind CSS.

**Why**:

- Pre-built components (buttons, modals, forms, tables, etc.)
- Fully customizable via code
- Headless (we control everything)
- Great documentation
- Accessibility built-in

**Use for**:

- Complex UI components
- Forms and data entry
- Dialogs and modals
- Data tables

### Database: **Supabase**

**What**: PostgreSQL database with real-time, authentication, and storage.

**Why**:

- Managed PostgreSQL (reliability without ops)
- Built-in authentication (email, OAuth, etc.)
- Real-time subscriptions (WebSockets)
- File storage (for uploads)
- REST API generated automatically
- Free tier sufficient for development

**Use for**:

- Storing all application data
- User authentication
- File storage
- Real-time features

### Database Client: **Supabase JavaScript SDK**

**What**: Type-safe client library for Supabase.

**Why**:

- Works seamlessly with TypeScript
- Query data from client or server
- Handles authentication tokens
- Real-time subscriptions

**Use for**:

- Querying data from pages/components
- Creating, updating, deleting records
- Managing user sessions

### Runtime: **Node.js 18+**

**What**: JavaScript runtime for server-side execution.

**Why**:

- Allows JavaScript on the backend
- Fast and lightweight
- Excellent async/await support
- Great for I/O-bound operations (APIs, databases)

**Use for**:

- Running Next.js server
- API routes
- Build process

### Package Manager: **npm**

**What**: JavaScript package manager.

**Use for**:

- Installing dependencies
- Running scripts (npm run dev, npm test, etc.)
- Version management

## Integrations & Libraries

### API Integration: **Anthropic SDK**

For integrating Claude AI capabilities:

- Completions and chat
- Prompt caching
- Vision capabilities

### Data Visualization: **D3.js, Recharts**

For charts and interactive visualizations (if needed).

### PDF Handling: **pdf-parse**

For reading and processing PDF files.

### Excel: **ExcelJS**

For reading and writing Excel spreadsheets.

### UI Icons: **Lucide React**

Lightweight, customizable icon library for React.

### Utility Functions: **clsx**

For conditional CSS classes in React.

## Development Tools

### Testing: **Jest** (recommended)

Unit and integration testing.

### Linting: **ESLint**

Code quality and style enforcement.

### Formatting: **Prettier**

Automatic code formatting.

### TypeScript Compiler: **tsc**

Type checking during development.

### Build Tool: **Next.js Webpack**

Automatic bundling and optimization (built-in).

## Development Environment

### IDE: **VS Code** (recommended)

Essential extensions:

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense

### Version Control: **Git**

For code history and collaboration.

## Deployment

### Hosting: **Vercel** (recommended)

Optimal for Next.js projects:

- Zero-config deployment
- Automatic optimizations
- Environment variables management
- Preview deployments for PRs
- Free tier available

**Alternative**: Any Node.js hosting (AWS, Digital Ocean, Railway, etc.)

### Database Hosting: **Supabase Cloud**

Managed PostgreSQL with free tier for development.

## Why This Stack?

### Productivity
- Full-stack JavaScript means one language everywhere
- TypeScript catches bugs early
- Next.js handles routing, optimization, and deployment
- Tailwind removes CSS complexity

### Scalability
- Supabase handles databases reliably
- React components scale well
- TypeScript makes refactoring safe
- Can start simple and grow to complex features

### Proven
- Same stack used successfully on Salem
- Large community and ecosystem
- Well-documented patterns and solutions
- Easy to hire for (common skills)

### Cost
- Supabase and Vercel free tiers support development
- Open-source tools throughout
- Minimal infrastructure overhead

### Developer Experience
- Hot reload and instant feedback
- Strong IDE support (autocomplete, type checking)
- Clear error messages
- Excellent documentation

## When to Consider Alternatives

| Need | Current | Alternative |
|------|---------|-------------|
| Real-time data sync | Supabase subscriptions | Firebase Realtime DB |
| Simplified auth | Supabase Auth | Auth0, NextAuth.js |
| Hosting | Vercel | AWS Amplify, Netlify |
| ORM | Drizzle (if needed) | Prisma, TypeORM |
| API validation | Zod (if needed) | io-ts, Yup |

Most projects will not need these — start with the core stack and add only when necessary.

## Version Management

Keep dependencies updated regularly:

```bash
npm outdated          # Check for updates
npm update            # Update to latest minor versions
npm install package@latest  # Update specific package
```

TypeScript strict mode should always be enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Learning Resources

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **React**: [react.dev](https://react.dev)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
