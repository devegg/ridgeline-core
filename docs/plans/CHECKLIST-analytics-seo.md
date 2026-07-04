# Checklist — Analytics, Search Console & Indexing

Written 2026-07-04. Two tracks: **[YOU]** = needs your accounts/dashboards (I
can't log in as you); **[ME]** = code I'll do while working your walkthrough list.
Checked against the live code, so nothing here is busywork.

## Already in place (verified — no action needed)
- **Sitemap** at `https://www.ridgelineknows.com/sitemap.xml` — home, /work, /papers, all 9 /work entries.
- **robots.txt** — public pages allowed; dashboard/portal/login blocked; links the sitemap.
- **Canonical domain = www** (metadataBase); per-page titles/descriptions; OG share image; favicon.
- **Structured data** (JSON-LD `ProfessionalService`: Myrtle Beach, phone, `hello@`, founder) on the homepage.

## A. Vercel Web Analytics
- [ ] **[ME]** Add `@vercel/analytics` + `<Analytics/>` to the root layout; deploy.
- [x] **[YOU]** Vercel dashboard → project **ridgeline-core** → **Analytics** tab → **Enable** (Web Analytics, free tier). Data shows within minutes of a visit once my code is live.
- [x] **[YOU]** *(optional)* Same tab — enable **Speed Insights** (Core Web Vitals) if you want it; tell me and I'll add its component too.

## B. Google Search Console  *(needs your Google account)*
- [x] **[YOU]** Open **search.google.com/search-console** → **Add property** → choose **Domain** → enter `ridgelineknows.com`.
- [x] **[YOU]** It shows a **TXT record** → add it in **Squarespace DNS** (same screen as your other records) → back in Search Console click **Verify**. (Domain property covers www + apex + http/https in one — best option.)
   - *Rather not touch DNS?* Alternative: pick **URL prefix** `https://www.ridgelineknows.com` and tell me — I'll drop Google's verification `<meta>` tag into the site instead.
- [x] **[YOU]** After it verifies → **Sitemaps** (left menu) → submit `sitemap.xml`.
- [x] **[YOU]** *(optional, speeds first indexing)* **URL Inspection** → paste your homepage → **Request indexing**. Repeat for /work and a top paper.

## C. Sitemap gap I'll close
- [ ] **[ME]** Add each **paper** (`/papers/<id>`) to the sitemap — it currently lists the /papers index but not the individual papers, and those long-form pages are your strongest SEO assets. After it deploys, re-submit the sitemap in Search Console (Google also re-crawls on its own).
- [ ] **[ME]** Tiny consistency fix: point the homepage JSON-LD `url` at the www canonical (currently apex, which just redirects).

## D. Optional, later (not needed to be found on Google)
- [x] **[YOU]** **Bing Webmaster Tools** — **import from Google Search Console** in ~2 clicks; covers Bing + DuckDuckGo. Nice-to-have.
- [x] **[YOU]** **Google Business Profile** — set up 2026-07-04 (service-area business; description + services on record in **§E** below).
- [ ] **GA4** — deliberately deferred (see our chat). Add later only if you need funnels, ad-campaign tracking, or demographics. Not needed now.

## E. Google Business Profile — set up 2026-07-04 (copy on record)
Set up as a **service-area business** (home address hidden; Myrtle Beach + nearby
as the service area). Primary category **Business management consultant**; secondary
**Software company** / **Consultant**. Verification is Google's own step (video or
phone/email). Add a logo, and a headshot if comfortable.

- [x] Description pasted as-is
- [x] Services added (one at a time)
- [ ] Verification complete (if Google still shows it pending)
- [ ] Photos added (logo; headshot optional)

**Description (on record):**
> I help small business owners stop losing hours to manual, repetitive work. Thirty years inside real business operations taught me where the time goes — the report rebuilt by hand every week, the paper form that gets emailed and lost, the spreadsheet three people update separately. I fix those, usually with custom software and automation built to fit how your business actually runs, not an off-the-shelf tool you have to bend around. I work with owners close enough to the operation to feel every inefficiency personally — real estate, medical and dental offices, property management, trades, and beyond. Based in Myrtle Beach, serving the South Carolina coast and clients nationwide.

**Services (on record):**
- **Operations Consulting** — A close look at how your business runs day to day, and where the hours are quietly going.
- **Workflow Automation** — Turning manual, repetitive steps into processes that run on their own.
- **Custom Software & Apps** — Purpose-built tools that fit your operation, instead of forcing you to fit theirs.
- **CRM & Operations Platforms** — Client tracking, pipelines, and job or service management built around how you actually work.
- **Data Cleanup & Migration** — Getting your data out of scattered spreadsheets and into one source you can trust.
- **Document & Form Automation** — Replacing paper forms and email back-and-forth with a clean digital workflow.
- **Reporting & Dashboards** — Numbers pulled together automatically, instead of rebuilt by hand every week.
- **Inbox & Communication Systems** — Filtering the noise so the messages that matter stop getting buried.

## Sensible order
1. **[ME]** Vercel Analytics component + sitemap paper-pages (my track, with your walkthrough revisions).
2. **[YOU]** Enable Analytics in the Vercel dashboard.
3. **[YOU]** Set up Search Console → verify → submit the sitemap.
4. **[YOU]** *(later, optional)* Bing import + Google Business Profile.
