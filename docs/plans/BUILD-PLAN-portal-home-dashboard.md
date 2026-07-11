# Build plan — Portal home dashboard ("the ten-second screen")

Date: 2026-07-11. Branch: `feature/portal-home`. PR to master.
Source research: `~/0/ridgeline/_inbox/research/14-Client Portal.md` and `15-Client Dashboard.md`.
Approved scope (Brian, 2026-07-11): core bundle + magic-link login + softened-dark portal theme.

## What this ships

The portal home page (`/portal`) stops redirecting to projects and becomes the client
dashboard: a one-column screen a non-technical owner reads in about ten seconds and
thinks "it's working, and it's paying for itself."

Zones, top to bottom (from report 15, Layout A):

1. **Health banner** — one traffic light, plain words, never color alone.
   Green: "Everything's running normally." Amber when an automation has an active
   issue: what happened, what I'm doing, no action needed from you.
   "Last updated" timestamp derived from the newest activity row.
2. **Value scoreboard** — three cards: hours saved, dollars saved, issues caught.
   This month big, since-launch small beneath. Rounded, hedged ("about", "~").
   A "How I count this ▸" expandable showing the math in plain language,
   including the 30% conservative haircut.
3. **Peace of mind** — a quiet card, owner-curated lines, no numeric claims.
4. **Caught & fixed log** — recent entries that make preventive work visible.
5. **What's next** — roadmap three-state list (next / in progress / just shipped)
   plus one obvious "Request a change →" button.

Plus: a written request log (portal + owner reply surface), magic-link sign-in,
a softened-dark portal theme, and two fixes (documents RLS entity mismatch,
portal role handling).

## Data model (migration `20260711000000_portal_value_layer.sql`)

All tables: RLS enabled, `owner_all` FOR ALL via app_metadata pattern (matches
20260105), client policies scoped to `app_metadata.client_id`, explicit GRANTs
to authenticated + service_role (the 20260108 lesson: missing grants show up as
silently empty lists).

- `automations` — client_id FK, name, plain_summary, status
  (running | issue | paused), baseline_minutes_per_item numeric,
  started_on date, sort_order. Client: SELECT own.
- `automation_activity` — automation_id FK, activity_on date,
  items_processed int, UNIQUE(automation_id, activity_on). Daily rollups;
  granular runs are a later concern. Client: SELECT via automation join.
- `caught_issues` — client_id FK, automation_id nullable FK, occurred_on,
  summary (plain language), detail nullable, status (resolved | active),
  resolved_on. Active issues drive the amber banner. Client: SELECT own.
- `roadmap_items` — client_id FK, title, state (next | in_progress | shipped),
  shipped_on nullable, sort_order. Client: SELECT own.
- `change_requests` — client_id FK, created_by uuid, title, detail, urgency
  (low | normal | high), status (new | in_progress | done), response text
  (my written reply), responded_on. Client: SELECT own + INSERT with
  WITH CHECK client_id = jwt client_id AND created_by = auth.uid().
  First client write surface in the schema; keep the check tight.
- `portal_highlights` — client_id FK, line text, sort_order. The peace-of-mind
  lines, owner-curated. Client: SELECT own.
- `clients.blended_labor_rate` numeric NOT NULL DEFAULT 45 — per-client blended
  hourly labor cost, set from the audit baseline. Never shown as a rate claim,
  only used in the savings math.
- **Documents fix** (same migration): recreate `client_shared_documents` policy
  to also expose entity_type 'project' (via projects.client_id) and 'client'
  (entity_id = client_id). Today a doc shared on a project is is_shared=true
  yet silently invisible to the client.

## The honest-math layer (`lib/portal/value.ts`)

Single source of truth for every view (dashboard now; monthly report and case
studies later render from the same numbers — report 15 §h).

- `HAIRCUT = 0.30`, hard-coded at the computation layer, visible in the copy.
- hours = items × baseline_minutes × (1 − HAIRCUT) / 60.
- dollars = hours × client.blended_labor_rate.
- Rounding: month hours to nearest 1, month dollars to nearest $100;
  since-launch hours to nearest 10, dollars to nearest $1,000. Wording uses
  "about" / "~". No decimals anywhere (false precision erodes trust).
- Never fabricate (workspace rule): all figures derive from stored activity
  rows and a stored baseline; if there is no data, the card says so plainly.

## Pages and components

- `app/(portal)/portal/page.tsx` — the dashboard (server component).
  Client path: client_id from app_metadata; every query also filters
  explicitly by client_id (defense in depth on top of RLS).
  Owner path: `?client=<id>` picker (list of clients) + an "Owner preview"
  ribbon. Decision: owners are allowed in the portal deliberately — it is the
  demo and QA surface — but always labeled, and home requires an explicit
  client pick so data is never mixed.
  Empty states: zero automations renders a friendly pre-launch message.
- `components/portal/` — HealthBanner, ValueCards, HowWeCount, PeaceOfMind,
  CaughtFixedLog, WhatsNext. Server components; HowWeCount uses native
  details/summary.
- `app/(portal)/portal/requests/page.tsx` — form on top (client component →
  server action; client_id derived server-side from the JWT, never from the
  form), list below with status + my replies. Owner preview: form hidden.
- `app/(dashboard)/requests/page.tsx` — owner list of all requests, inline
  respond (status + response) via server action. middleware DASHBOARD_PATHS
  gains `requests`; dashboard nav gains the link.
- `PortalNav` — adds Overview (exact-match active state) and Requests links;
  carries `?client=` through links when the viewer is the owner.

## Magic-link login

- Login page: two modes, password (default, unchanged) and "email me a
  sign-in link" — `signInWithOtp` with `shouldCreateUser: false` (a stranger's
  email must not create an account) and `emailRedirectTo` → `/auth/callback`.
- Callback route: after code exchange, if no explicit `next` param, redirect
  by role (client → /portal, else /overview) instead of always /overview.
- Ops note for Brian: confirm Supabase Auth → URL Configuration allows
  the production and localhost callback URLs, and the Magic Link email
  template is enabled.

## Softened-dark portal theme

- Scope: portal only. Marketing site and login stay warm-paper light.
- Mechanism: the tokens are CSS custom properties on `:root`; the portal
  wrapper re-declares them under `.portal-layout[data-theme="dark"]`.
  Everything inside inherits; no component rewrite.
- Palette: warm dark, no pure black, no bright white (Brian's eyes):
  bg ≈ #211F1B, paper ≈ #282521, ink ≈ #E9E2D2, muted inks lightened for
  contrast, rules darkened, blue/amber accents lightened to hold AA on dark.
- Default: system preference; toggle in PortalNav (sun/moon, lucide), persisted
  to localStorage (`rk-portal-theme`); pre-paint inline script prevents flash.
- Sweep portal components for hard-coded colors; replace with tokens.

## Seed (demo data — clearly labeled, never presented as real)

`scripts/seed-portal-demo.sql` — paste into the Supabase SQL editor (same
pattern as the client-portal runbook). Idempotent (fixed UUIDs, upserts).
Creates client "Demo Client (Sample Data)" with three automations in the
Ridgeline voice (order sync, invoice intake, lead intake), ~90 days of daily
activity at plausible volumes, caught issues (all resolved), roadmap items,
highlights, and one answered change request. Numbers land near the research
example (~14 hrs / ~$1,900 this month) so the screen reads true to the spec.

## Out of scope today (recorded so they stay decisions, not drift)

- Stripe billing tab deep-link (needs a Stripe account; zero paying clients).
- Tier gating (Watch / Improve / Own) and the locked upsell row.
- Monthly report email + case-study renderer (same data model, later).
- PDF export stub, provisioning automation, MFA.

## Verification before PR

- `npm run build` clean.
- Browser: /portal as owner preview with the demo client — light and dark,
  ten-second read; requests round-trip (submit as demo flow, respond as owner);
  login page link mode sends without error.
- Docs reconciled: STATUS.md portal section, decision notes.
