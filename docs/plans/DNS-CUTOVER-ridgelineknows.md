# DNS Cutover — ridgelineknows.com (paste-ready)

Your part, ~10 minutes total. Everything else is already done.

## 1. Add the domain in Vercel (1 min)
Vercel dashboard → project **ridgeline-core** → Settings → Domains → Add
`ridgelineknows.com` (and `www.ridgelineknows.com`, redirect www → apex).
Vercel will then display the exact records it wants — they should match:

## 2. In Squarespace Domains → DNS settings for ridgelineknows.com
Delete the Squarespace-site A records (the four 198.x parking ones) and the
`www` CNAME to ext-sq.squarespace.com, then add:

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 76.76.21.21            |
| CNAME | www  | cname.vercel-dns.com   |

(If Vercel's Domains screen shows different values, use Vercel's.)
Keep the nameservers at Squarespace — record-level change only.
Cert issues automatically a few minutes after DNS propagates; then
https://ridgelineknows.com serves the marketing page and the "Coming Soon"
parking page retires.

## 3. Supabase auth URLs (2 min) — so login works in production
Supabase dashboard → project **RidgelineKnows** → Authentication → URL
Configuration:
- Site URL: `https://ridgelineknows.com`
- Redirect URLs (one per line — Supabase rejects bare *.vercel.app wildcards;
  they must include the team suffix):
  `https://ridgelineknows.com/auth/callback`
  `https://www.ridgelineknows.com/auth/callback`
  `https://ridgeline-core.vercel.app/auth/callback`
  `https://ridgeline-core-*-devegg-9058s-projects.vercel.app/**`  (previews)
  `http://localhost:3000/**` and `http://localhost:3005/**`  (keeps local dev
  working once Site URL changes off the default)
- Password login works regardless of this list — it gates email links
  (password recovery, future magic links), so it must be right before the
  first "forgot password" email, not before the flip.

## 4. Resend — DEFERRED to BACKLOG.md 2026-07-03 (owner call)
The form code is live but soft-fails until this exists (by design):
1. resend.com/domains → Add domain `ridgelineknows.com` → it shows 3–4 DNS
   records (DKIM TXT, SPF/Return-Path MX+TXT on `send` subdomain) → add them
   in the SAME Squarespace DNS screen → Verify.
2. resend.com/api-keys → Create key (sending access, ridgelineknows.com
   only) → then either paste it into `core/.env.local` as
   `RESEND_API_KEY=...` yourself, or hand it to a session and we'll wire it
   locally + `vercel env add RESEND_API_KEY production`.
3. Test: submit the site form → lands at hello@ridgelineknows.com.

## 5. hello@ mailbox — DEFERRED to BACKLOG.md 2026-07-03 (owner call; see bounce note there)
The email convention (from RFQ Hunter, now standard): **hello@** = the human
mailbox on every product domain; purpose-named senders (contact@, digest@)
for systems. Make sure `hello@ridgelineknows.com` actually receives mail —
Squarespace Domains → Email forwarding → `hello@ → your real inbox` is the
free 2-minute version.

## 6. DONE 2026-07-03 — repo connected; pushes to master now auto-deploy
Vercel → ridgeline-core → Settings → Git → Connect `devegg/ridgeline-core`
(the CLI needed interactive confirmation, so I skipped it). After that,
every push to master auto-deploys — same as your other projects.
