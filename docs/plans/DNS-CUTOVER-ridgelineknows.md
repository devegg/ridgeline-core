# DNS Cutover — ridgelineknows.com (paste-ready)

**2026-07-03: §1–§3 DONE (owner). 2026-07-04: §4 (Resend) + §5 (Zoho `hello@`)
LIVE — contact form sends end-to-end (submit → Resend → Zoho inbox), verified.
Domain is live — apex 308-redirects to https://www.ridgelineknows.com (www is
primary in Vercel); site metadata canonicalized to www to match. §5 send-side auth
(SPF/DKIM/DMARC) confirmed 2026-07-04 — email fully live.**

## 1. DONE 2026-07-03 — Add the domain in Vercel (1 min)
Vercel dashboard → project **ridgeline-core** → Settings → Domains → Add
`ridgelineknows.com` (and `www.ridgelineknows.com`, redirect www → apex).
Vercel will then display the exact records it wants — they should match:

## 2. DONE 2026-07-03 — In Squarespace Domains → DNS settings for ridgelineknows.com
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

## 3. DONE 2026-07-03 — Supabase auth URLs (2 min) — so login works in production
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

## 4. DONE 2026-07-04 — Resend: contact form sends end-to-end
The form soft-failed until this existed (by design); now wired and verified.
**Status 2026-07-04:** owner created a separate free Resend account for
ridgelineknows.com, verified the domain, and added `RESEND_API_KEY` to Vercel
(Preview + Production). Contact form tested end-to-end: submit → Resend → Zoho
`hello@` inbox. Also hardened the form against a deploy-skew silent-hang
(commit b3ceec2: try/catch/finally in Contact.tsx + a 10s AbortController
timeout in contact.ts). Original setup steps kept below as reference (and for
other domains).
**Account (confirmed 2026-07-04):** Resend free = 1 domain / 3,000 emails-mo /
100-day; Pro is $20/mo for 10 domains. Since the existing Resend account's one
free domain is spoken for by another project (RFQ Hunter), spin up a **separate
free account for ridgelineknows.com** — legit for a distinct brand, $0. The
login email doesn't affect sending (domain + DKIM + API key do), so any address
you control works. Pro is the *consolidation* move once there's revenue: 10
domains covers every project on one dashboard, not a per-project cost. Steps:
1. resend.com/domains → Add domain `ridgelineknows.com` → it shows 3–4 DNS
   records (DKIM TXT, SPF/Return-Path MX+TXT on `send` subdomain) → add them
   in the SAME Squarespace DNS screen → Verify.
2. resend.com/api-keys → Create key (sending access, ridgelineknows.com
   only) → then either paste it into `core/.env.local` as
   `RESEND_API_KEY=...` yourself, or hand it to a session and we'll wire it
   locally + `vercel env add RESEND_API_KEY production`.
3. Test: submit the site form → lands at hello@ridgelineknows.com.

## 5. DONE 2026-07-04 — hello@ mailbox (Zoho Forever Free): live, receiving + SPF/DKIM/DMARC confirmed
The email convention (from RFQ Hunter, now standard): **hello@** = the human
mailbox on every product domain; purpose-named senders (contact@, digest@) for
systems. This gives `hello@ridgelineknows.com` a real mailbox that **sends and
receives** on its own — kept fully separate from wiseowldata.com, chosen over
forwarding so replies never leave as the wrong brand. Free tier: 1 domain, up
to 5 users, 5 GB, web + Zoho's own mobile apps (the free-tier limit is IMAP/POP
into third-party clients, NOT the Zoho app — so Android push notifications work).

**Status 2026-07-04 — DONE:** `hello@ridgelineknows.com` is live and receiving
(contact-form test landed in the Zoho inbox), and send-side **SPF, DKIM, and
DMARC are all confirmed** — outbound from `hello@` authenticates. The
authoritative DMARC record is the `_dmarc` TXT in Squarespace DNS; Zoho's admin
DMARC section is only a helper/reporting UI and is fine left as-is. Owner decided
against a `brian@` alias — `hello@` is the sole address; the old Squarespace
`brian@` forward was deleted. Notify: Zoho mobile app.

**Do the steps in this order** (verify → MX → SPF → DKIM → DMARC → forward/notify):

1. **Sign up on the free plan.** Use **email + password** (not "Sign in with
   Google") so the Ridgeline mail admin doesn't hang off another account — turn
   on 2FA and store the password in your manager. **The one trick:** Zoho's
   in-app "Choose the right plan for your organization" wizard shows ONLY paid
   tiers — the Forever Free plan is NOT on it. Get the free plan from the pricing
   page instead: **zoho.com/mail/zohomail-pricing.html** → either the "Mail Free"
   column at the top of the table or the "Forever Free Plan" panel at the very
   bottom → **Sign Up Now** → then continue with `ridgelineknows.com`. Free tier
   = 5 users, 5 GB each, 30 MB attachments, 1 domain, web + mobile app, no IMAP
   (which this workflow doesn't need); region-gated but US is fine. Note your
   **data center** (US signups use the zoho.com/US center — it sets your exact MX
   hostnames). If the paid org was already created, the free "Sign Up Now" may
   say you have an account — sign in and switch it down to free. Fallback if free
   is blocked: Mail Lite, $1.25/user/mo billed annually (~$15/yr, adds IMAP).
2. **Verify domain ownership.** Zoho shows a TXT (or CNAME) proof record → add
   it in the Squarespace DNS screen → click Verify in Zoho.
3. **Create the mailbox.** User `hello@ridgelineknows.com` — the single human
   address. Owner decided 2026-07-04 NOT to run a `brian@` alias: the old
   Squarespace `brian@` forward was deleted and none was created on Zoho, so
   `hello@` stands alone. Optional: add `contact@` / `support@` as aliases if ever
   needed (free tier allows aliases — real named addresses, no `+` needed for
   sending).
4. **DNS records** — add these in the SAME Squarespace DNS screen. US-datacenter
   values shown; **use whatever Zoho's console displays for your data center if
   they differ:**

   | Type | Host               | Value                                                        | Priority |
   |------|--------------------|--------------------------------------------------------------|----------|
   | MX   | @                  | mx.zoho.com                                                  | 10       |
   | MX   | @                  | mx2.zoho.com                                                 | 20       |
   | MX   | @                  | mx3.zoho.com                                                 | 50       |
   | TXT  | @                  | `v=spf1 include:zoho.com ~all`                              | —        |
   | TXT  | `<sel>._domainkey` | (the DKIM key Zoho generates — see step 5)                  | —        |
   | TXT  | `_dmarc`           | `v=DMARC1; p=none; rua=mailto:hello@ridgelineknows.com; fo=1` | —      |

   Delete any old/placeholder MX records first. The `@` A record (Vercel,
   76.76.21.21) stays — MX and A coexist. Only ONE SPF (TXT `@`) record may
   exist: since Resend lives on the `send.` subdomain (§4), the root SPF is
   Zoho-only and the two never collide.
5. **Enable DKIM.** Zoho Admin → Email Configuration → DKIM → enable for
   `ridgelineknows.com`. Zoho generates a selector + public key → paste that as
   the `<sel>._domainkey` TXT row above.
6. **Forwarding (a copy at wiseowldata, so you're notified).** Zoho webmail →
   Settings → Forwarding → add your wiseowldata.com address → confirm the code
   Zoho emails there. *If the free tier blocks auto-forward (Zoho gates it at
   times for anti-spam), skip this and rely on step 7 — same result.*
7. **Android notifications (the reliable notify path).** Install **Zoho Mail**
   from Google Play → sign in as hello@ → enable push. New mail pings your
   phone; tap in and reply.

**Reply rule:** always reply from the Zoho app/webmail so mail leaves as
`hello@` — never from the forwarded copy in wiseowldata (that would send as the
wrong brand, the exact thing you're avoiding).

**Coordination with §4 (Resend):** the root MX/SPF above = Zoho (human mail);
Resend verifies and sends from the `send.ridgelineknows.com` subdomain with its
own MX/SPF/DKIM, so nothing overlaps. The single DMARC record (step 4) covers
both. It starts at `p=none` (monitor only); tighten to `p=quarantine` once the
DMARC reports show both Zoho and Resend aligned.

## 6. DONE 2026-07-03 — repo connected; pushes to master now auto-deploy
Vercel → ridgeline-core → Settings → Git → Connect `devegg/ridgeline-core`
(the CLI needed interactive confirmation, so I skipped it). After that,
every push to master auto-deploys — same as your other projects.
