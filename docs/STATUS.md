# ridgeline-core — STATUS

Last updated: 2026-07-03. Code is ground truth; this reconciles to it.

## Shipped (live in production)

- **Domain**: https://www.ridgelineknows.com (apex 308→www; DNS at
  Squarespace, record-level; www is primary in Vercel). Flipped 2026-07-03.
- **Marketing site**: home (hero/proof/stories/contact), /work (11 entries,
  SSG), /papers (7 public papers, DB-driven), SEO (OG image, sitemap,
  robots), icon.
- **Papers pipeline**: documents.is_public + anon-read policy; papers are
  rows in `documents` (entity_type 'project'); drafts of record live in
  docs/gitignored/drafts/.
- **Dashboard** (owner role): overview, leads, clients, projects, proposals,
  assessments, deliverables, billing (overview/invoices/rates), documents
  index, settings, scaffolder, cleanup. Communications dropped 2026-07-03
  (owner call).
- **Client portal**: projects, assessments, deliverables, documents,
  billing + invoice detail — RLS-scoped via app_metadata role/client_id.
  Provisioning: docs/setup/CLIENT-PORTAL-RUNBOOK.md.
- **Contact form**: server action + honeypot; soft-fails politely until
  Resend exists (deferred to BACKLOG by owner).
- **CI**: GitHub Actions — tsc + build on push. Pushes to master
  auto-deploy (Vercel git-connected).

## Where things run

- Supabase cloud project RidgelineKnows (`eizoelivnnuukskorrgy`); May data
  restored + md5-verified. Local Docker volume retained as backup.
- Vercel project ridgeline-core (team devegg-9058s-projects).

## Not done / deferred (see BUILD-PLAN-ten-days.md + BACKLOG.md)

- Resend wiring + hello@ mailbox (owner-deferred; form soft-fails by design).
- RFQ Hunter white paper (entry on /work carries the story meanwhile).
- Tier 5 code quality: zod on actions, generated DB types, transaction on
  client conversion, ESLint config, a11y pass, primitive extraction.
- Print CSS for /papers unverified.
- Owner review pending on all 7 papers + 6 new /work entries (published
  2026-07-03 under "push and review live" green light).

## Standing rules

- Salem is never named publicly — ACME Manufacturing is the stage name.
- Docs/plans are the working authority during the sprint; this file is the
  cold-start summary between sessions.
