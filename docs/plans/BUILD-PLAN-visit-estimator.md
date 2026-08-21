# On-site visit estimator — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A phone-first screen where Brian prices a prospect's repetitive tasks out loud during a drop-in visit, while the owner watches the annual figure build.

**Architecture:** A new `(field)` route group escapes the sidebar-bound dashboard layout and repeats its owner-only auth gate. One client component holds the task list and computes every dollar figure in the browser (so a dead spot mid-conversation costs nothing); one server action writes a `prospect_visits` row plus its `visit_tasks` children all-or-nothing. All money math is derived on read from `lib/portal/value.ts` — no dollar totals are ever stored.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4 (CSS-first — tokens in `app/globals.css`, no config file), Supabase via `@supabase/ssr`, npm. No new dependencies.

**Spec:** `docs/plans/DESIGN-BRIEF-visit-estimator.md` — read it first. This plan argues from it; the six locked decisions there are not up for re-litigation during execution.

## Global Constraints

- **Never run SQL directly.** Every schema change is a numbered file in `supabase/migrations/` applied with `npm run migrate`. Never hand-paste into the Supabase dashboard. Prod applies are owner-run — the executor STOPS and asks.
- **Never `git add -A` or `git add .`** — stage explicit paths. A repo hook (`.claude/hooks/block-blanket-adds.mjs`) blocks it anyway.
- **`npx tsc --noEmit` before any commit that changes code.** Run the full `npm run build` only with the dev server stopped (they share `.next`).
- **Owner-only, deny-by-default (D8).** New tables get RLS with `role = 'owner'` policies and NO `role='client'` policies at all.
- **Money math is inherited, never reinvented.** Import `HAIRCUT` and `formatDollars` from `lib/portal/value.ts`. `HAIRCUT = 0.3`. Never redefine either.
- **The fee is shown on screen, derived, never stored.** 25% of the recovered figure, beside a note separating the estimated numbers from the firm rate (decision 6). No dollar amount of any kind is written to the database.
- **Voice = the phone keyboard's own mic.** No in-app speech recognition code (decision 1). Verified working on Brian's Android handset 2026-08-20 after granting Gboard microphone permission.
- **Copy voice:** plain English, short sentences, first person singular. Banned words: leverage, seamless, game-changer, unlock, empower, robust, synergy, deep dive.
- Branch `feature/visit-estimator` → PR to `master`. Merged ≠ shipped.

## File structure

| File | Responsibility |
|---|---|
| `supabase/migrations/20260820000000_visit_estimates.sql` | **Create.** `visit_tasks` table, CHECK bounds, index, owner-only RLS, grants |
| `lib/types.ts` | **Modify.** Add `VisitTask` interface beside `ProspectVisit` (~line 341) |
| `lib/field/estimate.ts` | **Create.** Annualization + per-visit totals. The only new math in the build |
| `scripts/test-estimate.mjs` | **Create.** Node test script, house pattern (`scripts/test-portal.mjs`) |
| `package.json` | **Modify.** Add the `test:estimate` script |
| `app/(field)/layout.tsx` | **Create.** Owner gate + theme pre-paint, full-bleed, no sidebar |
| `app/(field)/visit/[id]/page.tsx` | **Create.** Server page: loads the prospect, its last visit, signed card-photo URL |
| `components/field/VisitEstimator.tsx` | **Create.** The interactive task list and sticky running total |
| `app/actions/prospects.ts` | **Modify.** Add `saveVisitEstimateAction` after `logVisitAction` (~line 66) |
| `middleware.ts` | **Modify.** Add the field path to `DASHBOARD_PATHS` (line 5) |
| `app/globals.css` | **Modify.** `.field-*` styles, appended in a new commented section |
| `app/(dashboard)/prospects/page.tsx` | **Modify.** "Start a visit" link on each prospect card |

### A note on testing in this repo

There is no test framework here and this plan does not introduce one. The house pattern is a single bespoke Node script (`scripts/test-portal.mjs`). That means:

- **Tasks 2 and 7 are true TDD** — the math module and the database constraints are genuinely testable, so the failing test comes first.
- **Tasks 3–6 are verified by `npx tsc --noEmit` plus a real browser pass.** Do not fabricate component tests to satisfy a ritual; verify by driving the actual screen and reporting what you saw.

Node 22.22 is installed and `--experimental-strip-types` is confirmed working, so the `.mjs` test script imports the real `.ts` modules directly — no duplicated math, no build step. Type-only imports (`import type { ... } from '@/lib/types'`) are erased by the stripper, which is why the `@/` alias never needs resolving at test time. **Verified 2026-08-20:** a `.mjs` file importing `lib/portal/value.ts` returned `HAIRCUT = 0.3` and `formatDollars(5824) = ~$5,800`.

---

### Task 1: Migration and types

**Files:**
- Create: `supabase/migrations/20260820000000_visit_estimates.sql`
- Modify: `lib/types.ts` (add after the `ProspectVisit` interface, ~line 341)

**Interfaces:**
- Consumes: `prospects(id)`, `prospect_visits(id)` from migrations `20260712010000` / `20260712020000`
- Produces: table `visit_tasks`; TypeScript `VisitTask` used by Tasks 2, 4, 5, 6

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260820000000_visit_estimates.sql`:

```sql
-- On-site visit estimator (owner request 2026-08-20, DESIGN-BRIEF-visit-estimator).
-- A priced task observed during a drop-in visit: how long it takes, how often
-- it happens, what the person doing it costs. Money is NEVER stored — every
-- dollar figure is derived on read through lib/portal/value.ts, so changing a
-- rate can't leave stale money in the database.
--
-- Owner-only, like the rest of the field kit (D19/D20): no policies for
-- role=client at all.

create table visit_tasks (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  prospect_id    uuid not null references prospects(id) on delete cascade,
  -- set null, not cascade: deleting a mistaken visit log must not silently
  -- destroy the priced tasks gathered during it.
  visit_id       uuid references prospect_visits(id) on delete set null,
  label          text not null,
  who            text,
  -- Bounds mirror set_value_inputs (20260712000000) exactly, so a number
  -- captured in the field can never fall outside what the portal accepts.
  minutes_each   numeric not null check (minutes_each   >= 0.5 and minutes_each   <= 480),
  times_per_week numeric not null check (times_per_week >= 0.1 and times_per_week <= 500),
  hourly_rate    numeric not null check (hourly_rate    >= 5   and hourly_rate    <= 500),
  sort_order     int not null default 0
);

create index visit_tasks_prospect_idx on visit_tasks (prospect_id, created_at desc);

alter table visit_tasks enable row level security;

create policy visit_tasks_owner_all on visit_tasks for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');

grant all on visit_tasks to authenticated, service_role;
```

- [ ] **Step 2: Add the type**

In `lib/types.ts`, immediately after the `ProspectVisit` interface:

```ts
export interface VisitTask {
  id: string
  created_at: string
  prospect_id: string
  visit_id: string | null
  label: string
  who: string | null
  minutes_each: number
  times_per_week: number
  hourly_rate: number
  sort_order: number
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

- [ ] **Step 4: STOP — the owner applies the migration**

Do NOT run this yourself. Report to Brian:

> Migration `20260820000000_visit_estimates.sql` is ready. Apply it with `npm run migrate` when you're ready — prod applies are owner-run.

Wait for confirmation that it applied before starting Task 7 (Task 7 is the only task that needs the table to exist). Tasks 2–6 can proceed while it is pending.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260820000000_visit_estimates.sql lib/types.ts
git commit -m "feat: visit_tasks table — priced tasks from a drop-in visit"
```

---

### Task 2: The math module (TDD)

**Files:**
- Create: `lib/field/estimate.ts`
- Create: `scripts/test-estimate.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**
- Consumes: `HAIRCUT`, `formatDollars` from `lib/portal/value.ts`; `VisitTask` from Task 1
- Produces:
  - `annualCost(minutesEach: number, timesPerWeek: number, hourlyRate: number): number`
  - `annualRecovered(minutesEach: number, timesPerWeek: number, hourlyRate: number): number`
  - `commission(minutesEach: number, timesPerWeek: number, hourlyRate: number): number`
  - `visitTotals(tasks: EstimateInput[]): { cost: number; recovered: number; fee: number }`
  - `COMMISSION_RATE = 0.25`
  - `type EstimateInput = { minutes_each: number; times_per_week: number; hourly_rate: number }`

- [ ] **Step 1: Write the failing test**

Create `scripts/test-estimate.mjs`:

```js
#!/usr/bin/env node
/**
 * Visit-estimator test suite. Mirrors scripts/test-portal.mjs in shape.
 *
 *   npm run test:estimate
 *
 * Part 1 (pure math) needs nothing. Part 2 (database) needs .env.local and
 * the 20260820000000 migration applied; it creates throwaway rows and
 * deletes everything it made. Exit code 0 = all green.
 */
import { HAIRCUT, formatDollars } from "../lib/portal/value.ts";
import { annualCost, annualRecovered, commission, visitTotals } from "../lib/field/estimate.ts";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

console.log("\nPart 1 — the math\n");

// The worked example from the design brief.
const cost = annualCost(4, 60, 28);
ok("annualCost(4 min, 60/wk, $28) === 5824", cost === 5824, `got ${cost}`);
ok("displays as ~$5,800", formatDollars(cost) === "~$5,800", `got ${formatDollars(cost)}`);

const recovered = annualRecovered(4, 60, 28);
ok("annualRecovered applies HAIRCUT", recovered === cost * (1 - HAIRCUT), `got ${recovered}`);
ok("displays as ~$4,100", formatDollars(recovered) === "~$4,100", `got ${formatDollars(recovered)}`);

// Proves both surfaces share one implementation rather than two that agree today.
ok("HAIRCUT is the portal's, not a copy", HAIRCUT === 0.3, `got ${HAIRCUT}`);

// A visit is the sum of its tasks — the running total is per visit, not per task.
const totals = visitTotals([
  { minutes_each: 4, times_per_week: 60, hourly_rate: 28 },
  { minutes_each: 15, times_per_week: 5, hourly_rate: 30 },
]);
ok("visitTotals sums cost", totals.cost === 5824 + 1950, `got ${totals.cost}`);
ok("visitTotals sums recovered", totals.recovered === (5824 + 1950) * 0.7, `got ${totals.recovered}`);
ok("visitTotals of [] is zero", visitTotals([]).cost === 0);

// The fee rides on what's recovered, not on the raw cost — Brian is paid on
// savings, and the conservative number is the defensible one.
const fee = commission(4, 60, 28);
ok("commission is 25% of recovered", fee === recovered * 0.25, `got ${fee}`);
ok("fee displays as ~$1,000", formatDollars(fee) === "~$1,000", `got ${formatDollars(fee)}`);
ok("visitTotals fee matches", totals.fee === totals.recovered * 0.25, `got ${totals.fee}`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 1 : 0); // NOTE: inverted on purpose in step 1 — fixed in step 4
```

- [ ] **Step 2: Add the npm script and run it to verify it fails**

In `package.json`, add to `"scripts"`:

```json
"test:estimate": "node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/test-estimate.mjs"
```

Run: `npm run test:estimate`
Expected: FAIL — `Cannot find module .../lib/field/estimate.ts`. The module does not exist yet. This is the point.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/field/estimate.ts`:

```ts
import { HAIRCUT } from '../portal/value'

/**
 * On-site estimator math. The ONLY new arithmetic in this feature — the
 * haircut and the dollar formatting are inherited from lib/portal/value.ts
 * so the number Brian says in the field and the number the portal shows a
 * year later cannot drift apart.
 *
 * Relative import (not '@/') on purpose: scripts/test-estimate.mjs loads
 * this file directly through node's type stripper, which does not resolve
 * the tsconfig alias.
 */

export type EstimateInput = {
  minutes_each: number
  times_per_week: number
  hourly_rate: number
}

/** What the task costs the business today, per year, before any haircut. */
export function annualCost(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return (minutesEach * timesPerWeek * 52 * hourlyRate) / 60
}

/** What automating it would conservatively recover — the portal's 30% held back. */
export function annualRecovered(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return annualCost(minutesEach, timesPerWeek, hourlyRate) * (1 - HAIRCUT)
}

/** Brian's share, from the card: "If I save you $10,000, I keep $2,500."
    Charged against what is RECOVERED, not the raw cost — he is paid on
    savings, and the post-haircut number is the one he can defend. */
export const COMMISSION_RATE = 0.25

export function commission(minutesEach: number, timesPerWeek: number, hourlyRate: number): number {
  return annualRecovered(minutesEach, timesPerWeek, hourlyRate) * COMMISSION_RATE
}

/** A visit is the sum of its tasks. The owner watches THIS number build. */
export function visitTotals(tasks: EstimateInput[]): { cost: number; recovered: number; fee: number } {
  const cost = tasks.reduce(
    (sum, t) => sum + annualCost(t.minutes_each, t.times_per_week, t.hourly_rate),
    0
  )
  const recovered = cost * (1 - HAIRCUT)
  return { cost, recovered, fee: recovered * COMMISSION_RATE }
}
```

- [ ] **Step 4: Fix the deliberately-inverted exit code, then run the tests**

In `scripts/test-estimate.mjs`, change the last line to:

```js
process.exit(fail === 0 ? 0 : 1);
```

Run: `npm run test:estimate`
Expected: `11 passed, 0 failed`, exit 0.

- [ ] **Step 5: Typecheck and commit**

```bash
npx tsc --noEmit
git add lib/field/estimate.ts scripts/test-estimate.mjs package.json
git commit -m "feat: visit estimate math — annualize, haircut from the portal's one source"
```

---

### Task 3: The `(field)` route group

**Files:**
- Create: `app/(field)/layout.tsx`
- Modify: `middleware.ts` line 5

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`
- Produces: a full-bleed owner-gated layout wrapping everything under `app/(field)/`

- [ ] **Step 1: Create the layout**

Create `app/(field)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Pre-paint: apply the saved (or system) theme before first render so the
// screen never flashes the wrong mode. Same pattern as the dashboard.
const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('rk-dash-theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var el = document.querySelector('.field-layout');
    if (el) el.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

/**
 * Field screens are used standing in someone else's shop, on a phone, with
 * the owner reading over your shoulder. The dashboard layout's fixed 220px
 * sidebar leaves ~170px of content at 390px wide, so these routes get their
 * own full-bleed shell instead.
 *
 * The auth gate is duplicated from app/(dashboard)/layout.tsx rather than
 * shared: ~15 lines against restyling 15 shipped pages mid-feature.
 */
export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'owner') redirect('/portal')

  return (
    <div className="field-layout" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Add the path to the middleware regex**

In `middleware.ts`, line 5 currently reads:

```ts
const DASHBOARD_PATHS = /^\/(overview|leads|clients|projects|proposals|assessments|deliverables|billing|requests|documents|settings|cleanup)(\/|$)/
```

Replace with:

```ts
const DASHBOARD_PATHS = /^\/(overview|leads|clients|projects|proposals|assessments|deliverables|billing|requests|documents|settings|cleanup|prospects)(\/|$)/
```

`prospects` was missing — the field kit has been gated by its layout alone since it shipped. The layout redirect is real protection, so this is defense in depth, not a fix for a hole. It covers `/prospects`; `visit` is added alongside it for the new route.

- [ ] **Step 3: Typecheck and commit**

```bash
npx tsc --noEmit
git add "app/(field)/layout.tsx" middleware.ts
git commit -m "feat: (field) route group — full-bleed owner-gated shell for on-site screens"
```

---

### Task 4: The visit page (server)

**Files:**
- Create: `app/(field)/visit/[id]/page.tsx`

**Interfaces:**
- Consumes: `Prospect`, `ProspectVisit` from `lib/types`; `VisitEstimator` from Task 5
- Produces: the route `/visit/[id]`

> Task 5 creates `VisitEstimator`. If executing strictly in order, this task will not typecheck until Task 5 lands — that is expected. Run Task 4 step 3 after Task 5 step 2 if you are executing sequentially, or implement Tasks 4 and 5 together and commit once.

- [ ] **Step 1: Create the page**

Create `app/(field)/visit/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitEstimator } from '@/components/field/VisitEstimator'
import type { Prospect, ProspectVisit } from '@/lib/types'

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [prospectRes, visitsRes] = await Promise.all([
    supabase.from('prospects').select('*').eq('id', id).single(),
    supabase
      .from('prospect_visits')
      .select('*')
      .eq('prospect_id', id)
      .order('visited_on', { ascending: false })
      .limit(1),
  ])

  if (prospectRes.error || !prospectRes.data) notFound()
  const prospect = prospectRes.data as Prospect
  const lastVisit = (visitsRes.data ?? [])[0] as ProspectVisit | undefined

  // Card photos live in a private bucket — a short-lived signed URL, and
  // only when there is one.
  let photoUrl: string | null = null
  if (prospect.card_photo_path) {
    const { data } = await supabase.storage
      .from('cards')
      .createSignedUrl(prospect.card_photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <VisitEstimator
      prospect={prospect}
      lastCardWord={lastVisit?.card_word ?? null}
      photoUrl={photoUrl}
    />
  )
}
```

- [ ] **Step 2: Verify the route resolves**

Shipped as `/visit/[id]`. The first draft nested it under `/prospects/[id]/visit`; that was moved during the build, and the 404s that prompted the move turned out to be the preview tool serving the main checkout, not a route-group conflict. The shorter path was kept on its own merits.

- [ ] **Step 3: Typecheck and commit** (after Task 5 exists)

```bash
npx tsc --noEmit
git add "app/(field)/visit/[id]/page.tsx"
git commit -m "feat: visit page — loads the prospect, its last card word, signed card photo"
```

---

### Task 5: The estimator component

**Files:**
- Create: `components/field/VisitEstimator.tsx`
- Modify: `app/globals.css` (append a new `.field-*` section at the end)

**Interfaces:**
- Consumes: `annualCost`, `annualRecovered`, `visitTotals`, `EstimateInput` (Task 2); `formatDollars` from `lib/portal/value`; `saveVisitEstimateAction` (Task 6); `ActionState`, `Prospect` from `lib/types`
- Produces: `VisitEstimator({ prospect, lastCardWord, photoUrl })`

> This task consumes `saveVisitEstimateAction` from Task 6. Implement Tasks 5 and 6 together, or stub the import and commit both at the end of Task 6.

- [ ] **Step 1: Create the component**

Create `components/field/VisitEstimator.tsx`:

```tsx
'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { saveVisitEstimateAction } from '@/app/actions/prospects'
import { annualCost, annualRecovered, visitTotals, type EstimateInput } from '@/lib/field/estimate'
import { formatDollars } from '@/lib/portal/value'
import type { ActionState, Prospect } from '@/lib/types'

/** One task in progress. Strings, not numbers — an in-progress field is "" or
    "1." and coercing early fights the keyboard. Parsed at the edges. */
type Draft = {
  key: number
  label: string
  who: string
  minutes_each: string
  times_per_week: string
  rate_override: string
}

const emptyDraft = (key: number): Draft => ({
  key, label: '', who: '', minutes_each: '', times_per_week: '', rate_override: '',
})

/** A draft only counts toward the total once all three numbers are real. */
function priced(d: Draft, visitRate: string): { minutes_each: number; times_per_week: number; hourly_rate: number } | null {
  const minutes_each = Number(d.minutes_each)
  const times_per_week = Number(d.times_per_week)
  const hourly_rate = Number(d.rate_override || visitRate)
  if (!(minutes_each > 0 && times_per_week > 0 && hourly_rate > 0)) return null
  return { minutes_each, times_per_week, hourly_rate }
}

export function VisitEstimator({
  prospect, lastCardWord, photoUrl,
}: {
  prospect: Prospect
  lastCardWord: string | null
  photoUrl: string | null
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveVisitEstimateAction, null)
  const [visitRate, setVisitRate] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([emptyDraft(1)])
  const [note, setNote] = useState('')
  const [showCard, setShowCard] = useState(false)

  const set = (key: number, patch: Partial<Draft>) =>
    setDrafts(ds => ds.map(d => (d.key === key ? { ...d, ...patch } : d)))

  const pricedTasks = drafts.map(d => priced(d, visitRate)).filter(Boolean) as EstimateInput[]
  const totals = visitTotals(pricedTasks)

  const payload = drafts.flatMap(d => {
    const p = priced(d, visitRate)
    return p && d.label.trim() ? [{ label: d.label.trim(), who: d.who.trim() || null, ...p }] : []
  })

  return (
    <div className="field-screen">
      <header className="field-head">
        <Link href="/prospects" className="field-back">← Card drops</Link>
        <h1 className="field-title">{prospect.business_name}</h1>
        <p className="field-sub">
          {prospect.contact_name ?? 'No contact name yet'}
          {lastCardWord ? ` · card word: ${lastCardWord}` : ''}
        </p>
        {(photoUrl || prospect.phone) && (
          <button type="button" className="field-linkbtn" onClick={() => setShowCard(v => !v)}>
            {showCard ? 'Hide card' : 'Show card'}
          </button>
        )}
        {showCard && (
          <div className="field-card">
            {prospect.phone && <a href={`tel:${prospect.phone}`} className="field-tel">{prospect.phone}</a>}
            {photoUrl && <img src={photoUrl} alt="Business card" className="field-cardimg" />}
          </div>
        )}
      </header>

      <label className="field-label">
        What does an hour of their time cost? (loaded)
        <input
          type="number" inputMode="decimal" min="5" max="500" placeholder="28"
          className="field-input field-input--num"
          value={visitRate} onChange={e => setVisitRate(e.target.value)}
        />
      </label>

      {drafts.map((d, i) => {
        const p = priced(d, visitRate)
        return (
          <section key={d.key} className="field-task">
            <div className="field-task__num">Task {i + 1}</div>

            <label className="field-label">
              What is it?
              <input
                type="text" className="field-input" placeholder="Retyping vendor invoices from email"
                value={d.label} onChange={e => set(d.key, { label: e.target.value })}
              />
            </label>

            <label className="field-label">
              Who does it?
              <input
                type="text" className="field-input" placeholder="Sherri, office admin"
                value={d.who} onChange={e => set(d.key, { who: e.target.value })}
              />
            </label>

            <div className="field-row">
              <label className="field-label">
                Minutes each
                <input
                  type="number" inputMode="decimal" min="0.5" max="480" placeholder="4"
                  className="field-input field-input--num"
                  value={d.minutes_each} onChange={e => set(d.key, { minutes_each: e.target.value })}
                />
              </label>
              <label className="field-label">
                Times per week
                <input
                  type="number" inputMode="decimal" min="0.1" max="500" placeholder="60"
                  className="field-input field-input--num"
                  value={d.times_per_week} onChange={e => set(d.key, { times_per_week: e.target.value })}
                />
              </label>
            </div>

            <label className="field-label field-label--muted">
              Different rate for this one?
              <input
                type="number" inputMode="decimal" min="5" max="500" placeholder={visitRate || 'same as above'}
                className="field-input field-input--num"
                value={d.rate_override} onChange={e => set(d.key, { rate_override: e.target.value })}
              />
            </label>

            {p && (
              <div className="field-task__money">
                <span>Costs now</span>
                <strong>{formatDollars(annualCost(p.minutes_each, p.times_per_week, p.hourly_rate))}/yr</strong>
                <span>I&rsquo;d recover</span>
                <strong>{formatDollars(annualRecovered(p.minutes_each, p.times_per_week, p.hourly_rate))}/yr</strong>
              </div>
            )}

            {drafts.length > 1 && (
              <button type="button" className="field-linkbtn" onClick={() => setDrafts(ds => ds.filter(x => x.key !== d.key))}>
                Remove this task
              </button>
            )}
          </section>
        )
      })}

      <button
        type="button" className="field-add"
        onClick={() => setDrafts(ds => [...ds, emptyDraft(Math.max(0, ...ds.map(x => x.key)) + 1)])}
      >
        + Add another task
      </button>

      <label className="field-label">
        Notes
        <textarea
          className="field-input" rows={3} placeholder="Who I spoke to, what happens next"
          value={note} onChange={e => setNote(e.target.value)}
        />
      </label>

      <form action={formAction} className="field-save">
        <input type="hidden" name="prospect_id" value={prospect.id} />
        <input type="hidden" name="note" value={note} />
        <input type="hidden" name="card_word" value={lastCardWord ?? ''} />
        <input type="hidden" name="tasks" value={JSON.stringify(payload)} />
        <button type="submit" className="field-submit" disabled={pending || payload.length === 0}>
          {pending ? 'Saving…' : `Save visit${payload.length ? ` (${payload.length})` : ''}`}
        </button>
        {state?.errors?._root && <p className="field-error">{state.errors._root}</p>}
        {state?.message && <p className="field-ok">{state.message}</p>}
      </form>

      <div className="field-total">
        <div className="field-total__tag">Rough estimate</div>
        <div className="field-total__row">
          <span>Costs you now</span><strong>{formatDollars(totals.cost)}/yr</strong>
        </div>
        <div className="field-total__row field-total__row--lead">
          <span>I&rsquo;d realistically recover</span><strong>{formatDollars(totals.recovered)}/yr</strong>
        </div>
        <div className="field-total__row field-total__row--fee">
          <span>My fee (25% of that)</span><strong>{formatDollars(totals.fee)}/yr</strong>
        </div>
        <p className="field-total__note">
          30% held back — I&rsquo;d rather beat the number than miss it. The numbers are
          estimates until we count the real thing. The 25% rate is not — it&rsquo;s firm as
          long as these counts hold up. New work later is a change order we price together.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add the styles**

Append to the end of `app/globals.css`:

```css
/* ============================================================
   Field screens — phone-first, no sidebar. See
   docs/plans/DESIGN-BRIEF-visit-estimator.md
   ============================================================ */

.field-layout { min-height: 100vh; background: var(--bg); color: var(--ink); }
.field-screen { max-width: 640px; margin: 0 auto; padding: 20px 16px 240px; }

.field-back { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); text-decoration: none; }
.field-head { padding-bottom: 18px; border-bottom: 1px solid var(--rule); margin-bottom: 20px; }
.field-title { font-family: var(--serif); font-size: 27px; line-height: 1.15; margin: 10px 0 4px; font-weight: 400; }
.field-sub { font-size: 13.5px; color: var(--ink-muted); margin: 0; }
.field-card { margin-top: 12px; }
.field-tel { display: inline-block; font-size: 16px; color: var(--blue); margin-bottom: 8px; }
.field-cardimg { width: 100%; border-radius: 6px; border: 1px solid var(--rule); }

.field-label { display: block; font-size: 13px; color: var(--ink-muted); margin-bottom: 14px; }
.field-label--muted { opacity: 0.75; }
.field-input {
  display: block; width: 100%; margin-top: 5px; padding: 13px 12px;
  font: inherit; font-size: 16px; /* 16px stops mobile Safari/Chrome zoom-on-focus */
  color: var(--ink); background: var(--bg-deep);
  border: 1px solid var(--rule); border-radius: 6px;
}
.field-input:focus { outline: 2px solid var(--blue); outline-offset: -1px; }
.field-input--num { font-family: var(--mono); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field-task { padding: 16px 0 6px; border-top: 1px dashed var(--rule); }
.field-task__num { font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 12px; }
.field-task__money {
  display: grid; grid-template-columns: 1fr auto; gap: 4px 12px;
  padding: 12px; margin-bottom: 10px; border-radius: 6px; background: var(--bg-deep);
  font-size: 13.5px; color: var(--ink-muted);
}
.field-task__money strong { font-family: var(--mono); color: var(--ink); }

.field-linkbtn { background: none; border: none; padding: 0; font: inherit; font-size: 13px; color: var(--blue); text-decoration: underline; cursor: pointer; }
.field-add { display: block; width: 100%; padding: 13px; margin: 4px 0 22px; font: inherit; font-size: 14px; color: var(--blue); background: none; border: 1px dashed var(--rule); border-radius: 6px; cursor: pointer; }
.field-submit { width: 100%; padding: 15px; font: inherit; font-size: 15px; font-weight: 500; color: #fff; background: var(--blue); border: none; border-radius: 6px; cursor: pointer; }
.field-submit:disabled { opacity: 0.45; cursor: default; }
.field-error { font-size: 13.5px; color: #b4232a; margin: 10px 0 0; }
.field-ok { font-size: 13.5px; color: var(--ink-muted); margin: 10px 0 0; }

/* The number the owner watches. Pinned so it survives the keyboard opening. */
.field-total {
  position: sticky; bottom: 0; margin: 0 -16px; padding: 14px 16px 18px;
  background: var(--bg-deep); border-top: 1px solid var(--rule);
}
.field-total__tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--amber-deep); margin-bottom: 8px; }
.field-total__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 14px; color: var(--ink-muted); }
.field-total__row strong { font-family: var(--mono); font-size: 19px; color: var(--ink); }
.field-total__row--lead strong { font-size: 25px; color: var(--blue); }
.field-total__row--fee { margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--rule); }
.field-total__row--fee strong { color: var(--amber-deep); }
.field-total__note { font-size: 11.5px; color: var(--ink-soft); margin: 8px 0 0; line-height: 1.5; }
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0 once Task 6 has added `saveVisitEstimateAction`.

- [ ] **Step 4: Commit** (with Task 6)

---

### Task 6: The save action

**Files:**
- Modify: `app/actions/prospects.ts` — add after `logVisitAction` (ends ~line 66)

**Interfaces:**
- Consumes: `ownerClient()` (module-private, line 9); `ActionState`
- Produces: `saveVisitEstimateAction(_prev: ActionState, formData: FormData): Promise<ActionState>`

- [ ] **Step 1: Add the action**

Insert into `app/actions/prospects.ts` immediately after `logVisitAction`:

```ts
/** Bounds are enforced in three places on purpose: the browser input, here,
    and the CHECK constraints. The form is the only one a person can bypass. */
const BOUNDS = {
  minutes_each: [0.5, 480],
  times_per_week: [0.1, 500],
  hourly_rate: [5, 500],
} as const

export async function saveVisitEstimateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await ownerClient()
  if (!supabase) return { errors: { _root: 'Owner only.' } }

  const prospect_id = String(formData.get('prospect_id') ?? '')
  if (!prospect_id) return { errors: { _root: 'Missing prospect.' } }

  let parsed: unknown
  try {
    parsed = JSON.parse(String(formData.get('tasks') ?? '[]'))
  } catch {
    return { errors: { _root: 'Could not read the tasks — nothing was saved.' } }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { errors: { _root: 'Add at least one priced task before saving.' } }
  }

  const rows = []
  for (const [i, raw] of parsed.entries()) {
    const t = raw as Record<string, unknown>
    const label = String(t.label ?? '').trim()
    if (!label) return { errors: { _root: `Task ${i + 1} needs a name.` } }

    const nums: Record<string, number> = {}
    for (const [field, [lo, hi]] of Object.entries(BOUNDS)) {
      const n = Number(t[field])
      if (!Number.isFinite(n) || n < lo || n > hi) {
        return { errors: { _root: `Task ${i + 1}: ${field.replace(/_/g, ' ')} must be between ${lo} and ${hi}.` } }
      }
      nums[field] = n
    }

    rows.push({
      prospect_id,
      label,
      who: String(t.who ?? '').trim() || null,
      minutes_each: nums.minutes_each,
      times_per_week: nums.times_per_week,
      hourly_rate: nums.hourly_rate,
      sort_order: i,
    })
  }

  const { data: visit, error: visitErr } = await supabase
    .from('prospect_visits')
    .insert({
      prospect_id,
      visited_on: new Date().toISOString().slice(0, 10),
      card_word: String(formData.get('card_word') ?? '').trim() || null,
      note: String(formData.get('note') ?? '').trim() || null,
    })
    .select('id')
    .single()

  if (visitErr || !visit) return { errors: { _root: 'Saving the visit failed — nothing was saved. Try again.' } }

  const { error: tasksErr } = await supabase
    .from('visit_tasks')
    .insert(rows.map(r => ({ ...r, visit_id: visit.id })))

  if (tasksErr) {
    // All-or-nothing: a half-saved visit is worse than a failed one, because
    // it looks complete when you come back to it.
    await supabase.from('prospect_visits').delete().eq('id', visit.id)
    return { errors: { _root: 'Saving the tasks failed — nothing was saved. Try again.' } }
  }

  // Never walk a status backward — same guard as logVisitAction.
  await supabase
    .from('prospects')
    .update({ status: 'interested' })
    .eq('id', prospect_id)
    .in('status', ['untouched', 'visited'])

  revalidatePath('/prospects')
  return { message: `Saved — ${rows.length} task${rows.length === 1 ? '' : 's'} on this visit.` }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit Tasks 4, 5 and 6 together**

```bash
git add "app/(field)/visit/[id]/page.tsx" components/field/VisitEstimator.tsx app/actions/prospects.ts app/globals.css
git commit -m "feat: on-site visit estimator — live totals, all-or-nothing save"
```

---

### Task 7: Entry point, database tests, verification

**Files:**
- Modify: `app/(dashboard)/prospects/page.tsx` (pass a link through to `ProspectCard`)
- Modify: `components/dashboard/ProspectPanels.tsx` (`ProspectCard`)
- Modify: `scripts/test-estimate.mjs` (add Part 2)
- Modify: `docs/STATUS.md`, `BACKLOG.md`

**Requires:** the Task 1 migration to be applied. Confirm with Brian before starting.

- [ ] **Step 1: Add the entry point**

In `components/dashboard/ProspectPanels.tsx`, inside `ProspectCard`'s action row, add:

```tsx
<a href={`/prospects/${prospect.id}/visit`} className="field-linkbtn">Start a visit</a>
```

Match the surrounding markup — read the existing action row first and follow whatever element and class it already uses rather than pasting this verbatim if it clashes.

- [ ] **Step 2: Write the failing database tests**

Append Part 2 to `scripts/test-estimate.mjs`, above the summary lines. Reuse the env-reading preamble from `scripts/test-portal.mjs` lines 15–30 verbatim (it reads `.env.local` into `URL_`, `PUB`, `SECRET`). Add `const admin = createClient(URL_, SECRET)` and `import { randomUUID } from "node:crypto"`. No ephemeral user is needed — the anon key is a sufficient negative case here:

```js
console.log("\nPart 2 — the database\n");

const p = await admin.from("prospects").insert({ business_name: `ZZ Test ${randomUUID().slice(0, 8)}` }).select("id").single();
const prospectId = p.data.id;
const v = await admin.from("prospect_visits").insert({ prospect_id: prospectId }).select("id").single();

// CHECK constraints reject what the form would have rejected first.
for (const [field, bad] of [["hourly_rate", 4], ["hourly_rate", 501], ["minutes_each", 0.25], ["minutes_each", 481]]) {
  const row = { prospect_id: prospectId, label: "x", minutes_each: 4, times_per_week: 60, hourly_rate: 28, [field]: bad };
  const { error } = await admin.from("visit_tasks").insert(row);
  ok(`rejects ${field} = ${bad}`, !!error, "insert succeeded when it should have failed");
}

const good = await admin.from("visit_tasks").insert({
  prospect_id: prospectId, visit_id: v.data.id, label: "Retyping invoices",
  minutes_each: 4, times_per_week: 60, hourly_rate: 28,
}).select("id").single();
ok("accepts an in-bounds task", !good.error, good.error?.message);

// Deleting the visit must not take the priced tasks with it.
await admin.from("prospect_visits").delete().eq("id", v.data.id);
const orphan = await admin.from("visit_tasks").select("visit_id").eq("id", good.data.id).single();
ok("visit delete leaves the task, visit_id null", orphan.data && orphan.data.visit_id === null);

// D8 deny-by-default: a caller without the owner role reads nothing. The
// anon (publishable) key carries no role at all, which is the weakest
// caller there is — if it sees a row, the policy is wrong.
const anon = createClient(URL_, PUB);
const denied = await anon.from("visit_tasks").select("id");
ok("anon key reads no visit_tasks", (denied.data ?? []).length === 0, `saw ${(denied.data ?? []).length} rows`);

// Cleanup: the prospect cascade removes the tasks.
await admin.from("prospects").delete().eq("id", prospectId);
const gone = await admin.from("visit_tasks").select("id").eq("id", good.data.id);
ok("prospect delete cascades to tasks", (gone.data ?? []).length === 0);
```

- [ ] **Step 3: Run the tests**

Run: `npm run test:estimate`
Expected: all of Part 1 and Part 2 pass, exit 0. If Part 2 errors with `relation "visit_tasks" does not exist`, the Task 1 migration has not been applied — stop and ask Brian.

- [ ] **Step 4: Verify in a real browser**

Start the dev server with the preview tooling (never `npm run dev` via a raw shell). Then, at 390px width:

1. Navigate to `/prospects`, click "Start a visit" on any prospect.
2. Confirm no sidebar, full-bleed layout.
3. Enter a rate of `28`, then a task: `4` minutes, `60` per week. Confirm the task shows `~$5,800` and `~$4,100`.
4. Add a second task and confirm the sticky total sums both and stays visible with the on-screen keyboard open.
5. Confirm the "Rough estimate" tag, the three money lines (costs now / recovered / my fee), and the change-order note are all visible without scrolling the total block.
6. Save. Confirm the success message, and that the prospect's status moved to `interested` on `/prospects`.
7. Check `read_console_messages` for errors.
8. Screenshot the filled screen and share it.

**On the handset:** confirm the Gboard mic key appears on "What is it?" and "Who does it?" and is absent on the numeric fields. If it appears on the numeric fields too, that is a harmless bonus. If it is MISSING from the text fields, stop — decision 2's premise has failed and the design needs revisiting, not a workaround.

- [ ] **Step 5: Update the authority docs**

`docs/STATUS.md` — add a shipped entry. Also fix the stale "Pending merge — field kit v1 (PR #31)" heading at line 92; that merged as `d91b18d`.

`BACKLOG.md` — add: *"Collapse `.dash-sidebar` under ~820px. The field kit is phone-first but the dashboard layout has a fixed 220px sidebar with no mobile collapse (~170px of content at 390px). The visit estimator dodges it with its own `(field)` layout; the rest of Card drops does not."*

Run the `ridgeline-core-doc-sync` skill's reconciliation pass.

- [ ] **Step 6: Commit and open the PR**

```bash
npx tsc --noEmit
git add "app/(dashboard)/prospects/page.tsx" components/dashboard/ProspectPanels.tsx scripts/test-estimate.mjs docs/STATUS.md BACKLOG.md
git commit -m "feat: start-a-visit entry point, database tests, doc sync"
git push -u origin feature/visit-estimator
gh pr create --base master --title "feat: on-site visit estimator" --body "..."
```

Stop the dev server, then run `npm run build` once before the PR.

After merge: confirm CI is green AND production reflects `master` HEAD (`vercel ls ridgeline-core` in the FOREGROUND — the CLI returns empty output in background shells).

---

## Self-review notes

**Spec coverage.** Every section of the design brief maps to a task: math → 2; data model → 1; screen → 5; routing/layout → 3, 4; save path → 6; testing → 2, 7. All six locked decisions are represented — decision 1 and 2 in the field types (Task 5 step 1) and the handset check (Task 7 step 4); decision 3 in the two-line money display; decision 4 in the absence of any email or proposal path; decision 5 in the `(field)` group; decision 6 in the `field-total__tag` "Rough estimate" label and the absence of fee math anywhere.

**Known ordering wrinkle.** Tasks 4, 5 and 6 are mutually dependent (page → component → action) and commit together at Task 6 step 3. This is called out in each task rather than pretending they are independent.

**Deliberate deviation from strict TDD.** Tasks 3–6 have no automated tests because this repo has no component or route test infrastructure and this plan does not add one. They are gated by `npx tsc --noEmit` and the browser pass in Task 7 step 4. Tasks 2 and 7 are genuinely test-first.
