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
- [ ] **[YOU]** Vercel dashboard → project **ridgeline-core** → **Analytics** tab → **Enable** (Web Analytics, free tier). Data shows within minutes of a visit once my code is live.
- [ ] **[YOU]** *(optional)* Same tab — enable **Speed Insights** (Core Web Vitals) if you want it; tell me and I'll add its component too.

## B. Google Search Console  *(needs your Google account)*
- [ ] **[YOU]** Open **search.google.com/search-console** → **Add property** → choose **Domain** → enter `ridgelineknows.com`.
- [ ] **[YOU]** It shows a **TXT record** → add it in **Squarespace DNS** (same screen as your other records) → back in Search Console click **Verify**. (Domain property covers www + apex + http/https in one — best option.)
   - *Rather not touch DNS?* Alternative: pick **URL prefix** `https://www.ridgelineknows.com` and tell me — I'll drop Google's verification `<meta>` tag into the site instead.
- [ ] **[YOU]** After it verifies → **Sitemaps** (left menu) → submit `sitemap.xml`.
- [ ] **[YOU]** *(optional, speeds first indexing)* **URL Inspection** → paste your homepage → **Request indexing**. Repeat for /work and a top paper.

## C. Sitemap gap I'll close
- [ ] **[ME]** Add each **paper** (`/papers/<id>`) to the sitemap — it currently lists the /papers index but not the individual papers, and those long-form pages are your strongest SEO assets. After it deploys, re-submit the sitemap in Search Console (Google also re-crawls on its own).
- [ ] **[ME]** Tiny consistency fix: point the homepage JSON-LD `url` at the www canonical (currently apex, which just redirects).

## D. Optional, later (not needed to be found on Google)
- [ ] **[YOU]** **Bing Webmaster Tools** — **import from Google Search Console** in ~2 clicks; covers Bing + DuckDuckGo. Nice-to-have.
- [ ] **[YOU]** **Google Business Profile** — free; helps a *local* (Myrtle Beach) consultant surface in local/maps searches. Worth it if local clients matter.
- [ ] **GA4** — deliberately deferred (see our chat). Add later only if you need funnels, ad-campaign tracking, or demographics. Not needed now.

## Sensible order
1. **[ME]** Vercel Analytics component + sitemap paper-pages (my track, with your walkthrough revisions).
2. **[YOU]** Enable Analytics in the Vercel dashboard.
3. **[YOU]** Set up Search Console → verify → submit the sitemap.
4. **[YOU]** *(later, optional)* Bing import + Google Business Profile.
