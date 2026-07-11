# ADR-100 — Portal value layer and home dashboard

Date: 2026-07-11. Status: accepted (feature/portal-home).
Context: docs/plans/BUILD-PLAN-portal-home-dashboard.md, built from the
2026-07 client-portal and client-dashboard research
(`~/0/ridgeline/_inbox/research/14-Client Portal.md`, `15-Client Dashboard.md`).

## Decisions

1. **The portal home is a value dashboard, not a project list.** `/portal`
   renders health banner → value scoreboard → peace of mind → caught & fixed →
   what's next. One data model (automations, automation_activity,
   caught_issues, roadmap_items, portal_highlights) will also feed the monthly
   report and anonymized case studies later — same numbers everywhere.

2. **Honest math lives in code, not the database.** The 30% conservative
   haircut and all rounding rules are constants in `lib/portal/value.ts`,
   applied identically to every view. Dollars = post-haircut hours × the
   client's `blended_labor_rate` (a cost input measured at the audit, never a
   price claim). Rounded, hedged numbers only — no decimals on estimates.

3. **Owners may browse the portal, deliberately.** It is the demo and QA
   surface. Every owner view is labeled ("Owner preview"), and the home page
   requires an explicit `?client=` pick so client data is never mixed. Client
   accounts stay locked to their own `client_id` via app_metadata + RLS, with
   explicit query filters as defense in depth.

4. **change_requests is the schema's first client WRITE.** The insert policy
   requires client role AND `client_id` = the JWT's client_id AND
   `created_by` = `auth.uid()`. The server action derives both from the
   session, never from the form.

5. **Magic-link sign-in uses `shouldCreateUser: false`.** An unknown email
   must never create an account. Password sign-in stays. The auth callback
   routes by role when no explicit `next` is given.

6. **Dark theme is scoped to the portal wrapper.** Tokens are re-declared
   under `.portal-layout[data-theme="dark"]` (softened warm dark, no pure
   black or white — Brian's light-sensitive eyes). Marketing site and login
   stay warm-paper light. Preference persists in localStorage
   (`rk-portal-theme`); default follows the system.

7. **Deferred, on purpose:** Stripe billing deep-link (no Stripe account yet;
   zero paying clients), tier gating (Watch/Improve/Own), the monthly report
   email, case-study renderer, PDF export, provisioning automation. The
   portal-adoption lever (report + invoices live ONLY behind the login) applies
   once there is a real retainer client.

8. **Migration runner adopted (addendum, same day).** ridgeline-core predates
   the Genesis Kit and was still hand-pasting SQL in the Supabase editor —
   the Kit's rule ("numbered migrations applied with `scripts/run-migration.mjs`;
   never hand-paste SQL anywhere") now applies here. The runner is adapted
   from RFQ Hunter's reference implementation with a BASELINE constant
   (everything through 20260110 was hand-applied pre-runner) and a one-off
   mode for seeds. Requires DATABASE_URL in `.env.local`; owner-run on
   purpose. The 20260108 missing-GRANTs incident is the cautionary tale.

9. **Security hardening (same-day review findings, applied).** Four-agent
   review (2026-07-11) found the authorization model failed OPEN: an absent
   app_metadata.role was treated as owner in code and RLS. Now: owner access
   requires the explicit role everywhere (middleware, both layouts, pages,
   actions, all owner_all policies); migration 20260711100000 stamps existing
   non-client users as owner, so future users default to NO access. Also
   fixed: open redirect in the auth callback (`next` restricted to same-origin
   relative paths); `javascript:` hrefs from the anon-writable leads table
   (render guard `lib/safe-url.ts` + http(s) CHECK constraints); client-visible
   issue counts computed from a display-limited slice (now real SQL counts);
   value totals moved to a SQL aggregate (`portal_value_raw`, SECURITY INVOKER)
   so they cannot truncate at PostgREST's row cap; change_requests insert
   policy pinned to status='new' with no response fields; anon default
   privileges revoked for future tables and RLS enabled on schema_migrations.
   OPS: confirm public sign-ups are DISABLED in Supabase Auth settings —
   the app never creates accounts.

## Consequences

- Real clients need a measured `baseline_minutes_per_item` per automation and
  a real `blended_labor_rate` before their dashboard shows numbers — the
  audit produces both. No baseline, no claim.
- `automation_activity` is a daily rollup by hand or by script for now; wiring
  live n8n (or similar) events into it is a later engagement-driven task.
- Demo data lives under one clearly-named client ("Demo Client (Sample
  Data)"), seeded by `scripts/seed-portal-demo.sql`, removable with one DELETE.
