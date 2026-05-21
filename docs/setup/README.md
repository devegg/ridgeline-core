# Development Setup — Ridgeline

This guide covers setting up your local development environment for working on Ridgeline.

## Prerequisites

- **Node.js**: v18+ (download from [nodejs.org](https://nodejs.org/))
- **npm or yarn**: Comes with Node.js
- **Git**: For version control
- **A text editor**: VS Code recommended

Verify installations:

```bash
node --version
npm --version
git --version
```

## Initial Setup

### 1. Install Dependencies

```bash
cd /0/ridgeline
npm install
```

This reads `package.json` and installs all required packages.

### 2. Configure Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and add:

- `API_KEY` — Your API credentials (if applicable)
- `DATABASE_URL` — Connection string for Supabase or your database
- `NODE_ENV` — Set to `development`
- Any other required keys (see comments in `.env.example`)

**Never commit `.env` to Git** — it contains secrets. Use `.env.example` as a template only.

### 3. (If using Supabase) Set Up the Database

Follow the steps in `/docs/deployment/` to initialize your Supabase project and any required tables.

## Running Locally

### Start the Development Server

```bash
npm run dev
```

Output will show:

```
▲ Next.js 16.2.3
  - Ready in 1.2s
  - Local: http://localhost:3000
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

(Add test configuration if tests are in use)

### Linting

```bash
npm run lint
```

Fixes formatting issues:

```bash
npm run lint -- --fix
```

## Project Structure for Development

When working in `/app/`:

- **`/app/page.tsx`** — Home page
- **`/app/layout.tsx`** — Root layout (shared across all pages)
- **`/app/api/`** — API routes
- **`/components/`** — Reusable React components
- **`/lib/`** — Utility functions, helpers, database queries
- **`/public/`** — Static assets (images, fonts, etc.)

See `/docs/architecture/PROJECT_STRUCTURE.md` for the full folder guide.

## Common Tasks

### Create a New Page

1. Create folder: `app/your-page/`
2. Create file: `app/your-page/page.tsx`
3. Add React component
4. Next.js automatically routes it to `/your-page`

### Add an API Endpoint

1. Create file: `app/api/your-endpoint/route.ts`
2. Export `GET`, `POST`, etc. functions
3. Call from frontend: `fetch('/api/your-endpoint')`

### Database Queries

Use Supabase client from `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
const { data, error } = await supabase.from('table').select()
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
lsof -ti :3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### node_modules Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

- Restart the dev server after changing `.env`
- Check `.env` file exists in project root
- Ensure no spaces around `=`: `KEY=value` not `KEY = value`

### Supabase Connection Issues

- Verify `DATABASE_URL` in `.env`
- Check Supabase project is active
- See `/docs/deployment/` for connection setup

## Next Steps

- Read `/docs/architecture/` to understand system design
- Check `/docs/features/` for feature specs
- Review `/docs/decisions/` for architectural choices
- See `/docs/deployment/` when ready to deploy

## Getting Help

- Check existing docs in `/docs/`
- Review project issues or comments in `/docs/client/` for context
- Look at `/docs/extras/research/` for reference materials
