# PR Notes — full history

> **Canonical, detailed PR log.** The full body of every merged PR, newest first — the detailed
> companion to the release narrative in `docs/STATUS.md`. STATUS stays the readable account of what
> shipped and why; this holds everything each PR actually said. Tracked under `docs/`, so
> `scripts/combine-files.cjs` carries it into the snapshot and the planning side gets the whole
> history.
>
> **GENERATED — do not hand-edit.** Regenerate with `node scripts/gen-pr-notes.mjs` (needs an authed
> `gh`); re-run after merging a PR, as part of the doc-sync pass. Reading GitHub directly means it
> can never silently drift from what actually shipped.

_Generated 2026-08-22 from 60 merged PRs (#1–#60)._

---
## #60 — feat: the accounts screen — who can sign in, and when they last did
merged 2026-08-22 · `3157947`

BUILD-PLAN §2.3. `/accounts`, owner-only.

Answering "does this client have a login?" or "have they ever signed in?" needed a SQL query. Revoking access meant opening the Supabase dashboard. Both now live on one page.

## What it shows

- **A row per client whether or not a login exists.** Today that's 4 clients and 1 login, so "no login" is the state the screen mostly reports — with inline Create login reusing the same provisioning action the per-client panel uses.
- **Accounts that map to no client get their own table.** They can sign in, but RLS scopes them to a client that's gone or was never set, so the portal shows them nothing — and nothing else in the app surfaces them at all. This is the case the screen exists to catch.
- Last sign-in distinguishes **"Never"** (login exists, unused) from **"—"** (no login).

## Decisions

- **Revoke is a reversible disable, never a delete (D26).** Supabase `ban_duration`. The account and its sign-in history survive, so "were they cut off, and when" stays answerable, and the same button puts it back. Deleting a login is not offered anywhere — the owner dropped it deliberately.
- Two guards: you cannot disable your own account (locking yourself out of the dashboard has no in-app recovery), and an owner account is refused outright.

## Notes

- **No migration.** `last_sign_in_at`, `banned_until`, `email` and `created_at` all ride the auth user object.
- **`/accounts` added to `DASHBOARD_PATHS`** in `middleware.ts`. A dashboard route missing from that regex sits outside the owner gate.
- **One paginated `listUsers` walk.** The three older call sites ask for `perPage: 1000` and silently drop anything past the first thousand. Those are left alone — separate concern.

## A global that would have broken silently

`.data-table` stretches the first cell's link across the whole row (#47). The rule lifting other cells back above that overlay named only `a` — true of every table that existed when it was written. Every control here is a button, so the first click on "Disable access" hovered, looked live, and **navigated to the client page instead**. Interactive elements are now lifted as a class, so the next table with a control in it doesn't rediscover this.

## Verification

- `npm run test:portal` — **54 passed, 0 failed** (7 new checks, section F). `banned_until` behaviour was *measured* on a throwaway account rather than assumed: absent when never banned, a future timestamp while banned (through `listUsers`, not just `updateUserById`), absent again once lifted.
- `npx tsc --noEmit` clean. `npm run lint` 0 errors (9 pre-existing warnings, none in touched files).
- Driven against production with a throwaway owner account, deleted after: disable → Access reads Disabled and the button flips to Re-enable → re-enable → back to Active, confirmed at the API. The demo client's login was left exactly as found. No test data written to production.

## Also in this branch

D25 records that **vision-model card reading is deferred and D20 stands** — no documented failing card exists, and the owner cut handwritten job sheets. And `SUPABASE_SECRET_KEY` is confirmed in Vercel production (42 days, authenticating) — it was a stale owner step, and it was **not** what gated §2.2. The Magic Link template edit is, and remains open.

---

## #59 — docs: Stage 1 complete, and route ordering is cut
merged 2026-08-22 · `12d6fde`

Plan reconciliation at session end.

## Stage 1 is complete

Landed 2026-08-22, six days ahead of the 08-29 target. Each item now carries the PR that shipped it (#52, #54–#57) so the plan stops reading as pending work. Production was verified at `master` HEAD after each merge.

## 1.5's heading was wrong

It said "visit tasks become **draft automations**". What shipped writes **roadmap items**.

`automations.status` is `running | issue | paused` — there is no `planned` — so a row written at conversion would have shown a client work as *live that had not been built*. The heading is corrected and the reason recorded next to it, because a plan describing something other than what shipped is exactly the drift the doc-sync pass exists to catch.

## 2.1 route ordering is CUT

Owner decision, 2026-08-22. The 88 pins are already on Brian's Google Map, and he knows the area and its traffic patterns — he drives whatever is easiest as he goes.

An app-side "nearest first" sort would be a worse version of a decision he already makes better, and it would compete with the tool he actually uses on the road. The alphabetical list stays: what matters on `/visit` is finding the business you're standing outside, which the client-side search already handles.

Stage 2 is now client notifications, the accounts screen, and the owner-only steps.

---

## #58 — docs: session reconciliation — PRs #52–#57, D24
merged 2026-08-22 · `a30e91b`

The doc-sync pass for today's session. STATUS.md was five PRs behind.

## STATUS.md

New entry covering Stage 1 of the field-to-client chain (#52, #54–#57) and the RFQ Hunter process port (#53). It opens with the finding that drove the work — read from the production database, not the docs:

> 4 client records (2 demos, 1 Ridgeline itself), 6 automations all belonging to demos, **one client-role account that signed in once on 2026-07-11 and never returned**, 88 prospects all `untouched`, zero `visit_tasks`.

Two findings recorded so they aren't rediscovered the hard way:

- the global `section { padding: clamp(72px, 11vw, 140px) }` from the marketing site applies to **every** `<section>` in the app — a new field panel rendered as a 212px box holding one line of text
- the push guard **always exits 0** and signals denial as JSON on stdout; reading the exit code reports every case as allowed

Also records why #54–#57 landed as merge commits rather than squashes: each branch carried the previous ones, so squashing the first made every follower conflict against a master holding the same changes under a new SHA.

## decisions-log.md

`Last Updated` → today. The **"no baseline, no claim"** open item is marked half-answered: the blended rate now arrives automatically at conversion (#57), weighted by annual minutes from the on-site visit. Only the per-automation baseline still waits for a build to go live — and by then the visit's timings are on the client's roadmap, so it's a read rather than a re-measure.

## PR-NOTES.md

Regenerated — 57 merged PRs. Second run of the generator, first one that includes the work it documents.

---

## #57 — feat: converting a lead carries the visit onto the client
merged 2026-08-22 · `cfbc2e3`

**Stacks on #56.** Merge order: #52 → #54 → #55 → #56 → this. (#53 is independent.)

Build plan item 1.5 — the last of the four breaks. Lead → client created the record at the default **$45/hr with nothing else**, so the rate and task list measured in the owner's own office had to be retyped from a table nothing read.

## I changed the approach from the plan, deliberately

The plan said "visit tasks become **draft automations**." The schema disagrees, and the schema is right.

`automations.status` is `running | issue | paused` — there is no `planned`. A row written at conversion would show a client work as **live that has not been built**, which is exactly what the honesty rails exist to prevent. Widening that CHECK would also ripple into the health banner, the value query and the pre-launch empty state.

So the tasks land on **`roadmap_items`** instead — which is literally what "What's next" means, needs no migration, and is already rendered in the portal. The real automation gets created when the build ships, on the portal-data screen, where the baseline can be read off the same visit.

Net effect is what the review wanted: a first portal login shows the client their own tasks in their own words, with their real rate behind the math, and an honest "nothing running yet" state above it.

## blendedRate weights by annual minutes

A straight mean of task rates lets one rare $90/hr task drag up a client whose real cost of labour is $28. Weighting by `minutes × frequency` gives the task that eats the hours the weight it deserves.

Worked example — 4min × 60/wk @ $28 and 12min × 9/wk @ $34:

- weighted: **$29.86**
- naive average: $31.00

A weighted mean cannot leave the range of its inputs, and every input is already inside the $5–$500 the form and the CHECK constraints enforce.

## Nothing is overwritten

The rate is set only if a visit measured one. Roadmap items are added only when the client has none — so re-running a conversion, or attaching a second lead to an existing client, cannot duplicate the list or reset a rate the client has since corrected through the portal (**D18**: those inputs are theirs).

The whole carry-across is wrapped. A failure logs and the conversion stands — the client record is what matters; a missing roadmap row is a thirty-second fix on the portal-data screen.

## Verification

- `blendedRate` checked against five cases including the weighted-vs-naive distinction and zero-weight rows
- `npm run test:estimate` 19/19, `npm run test:recap` 22/22
- `npx tsc --noEmit` clean, `npm run lint` 0 errors

**Not exercised end to end.** That needs a real lead converted to a real client in production, and I would rather not create a client record to prove a code path. The first genuine conversion is the test; the carry-across fails soft if anything is off.

---

## #56 — feat: follow-up dates on prospects, in the panel that already exists
merged 2026-08-22 · `161dced`

**Stacks on #55.** Merge order: #52 → #54 → #55 → this.

Build plan item 1.4. `leads` has had `follow_up_date` since January and the Overview already surfaces "Follow-ups due" from it. `prospects` had nothing — so a drop-in that went well but wasn't promoted to a Lead the same day had nothing chasing it. The warmest moment in the pipeline was the one with no reminder.

## Migration — applied

`20260822000000_prospect_follow_up.sql`, **already applied** under D24 (additive, so I run it). One nullable column plus a partial index covering exactly the Overview predicate: a date set, and a status still in the funnel.

Verified in the database: column `date`/nullable, index `prospects_follow_up_idx` present.

## The control

Three chips — **In a week / Two weeks / A month** — not a date picker. This gets tapped one-handed in a parking lot. Set one and the screen names the date back to you; clearing is explicit, and saving another visit never silently drops a date you set earlier.

`inDays()` builds the date from local parts. `toISOString()` is UTC and returns *yesterday* after 8pm on the east coast — precisely when a field day gets written up.

## The panel

Both sources merge into one list sorted by date, each row tagged `Lead` or `Card drop` and linking where you'd act on it (`/leads/[id]` or `/visit/[id]`). A follow-up is a follow-up; the table it came from only decides the destination.

## Verification

On the running worktree with an owner session:

- chips produce `2026-09-05` for "Two weeks" from today — no timezone slip; hidden input, on-state and the confirmation line all agree
- merged panel sorts overdue-first, paints overdue `rgb(177,75,60)` and shows `today` for today's date
- lead rows link to `/leads/…`, card-drop rows to `/visit/…`
- `npx tsc --noEmit` clean, `npm run lint` 0 errors

Overview data was a temporary local stub, reverted before commit. Production has **0** prospects with a follow-up date and I'd rather not invent some. The throwaway owner account used for verification was deleted.

---

## #55 — feat: email the visit recap, written to be forwarded
merged 2026-08-22 · `441e8f8`

**Stacks on #54** (which stacks on #52). Merge order: #52 → #54 → this.

Build plan item 1.3. The follow-up after a drop-in was written from memory — which is why it often wasn't written at all.

## Where it lives

Inside the prior-estimate panel from #54, so it works both on the walk back to the truck and three weeks later against the same saved visit.

It sends to **the signed-in owner's own address**. There is no recipient field, so there's nothing to aim at a third party by editing a form.

## The decision it implements

Owner call, 2026-08-21: the recap goes to Brian, who forwards it — not straight to the prospect. A human looks at an OCR'd email address before anything is sent to it, and you get to add a line first.

## Which numbers it may quote

Not a style choice. D21 puts cost and the one-time fee on the phone by default and keeps the recovered figure behind a tap. The email shows those same two and the same disclaimer, word for word. **A figure the owner never saw on screen would be a new claim, made in writing** — exactly what D21 exists to prevent.

The test asserts it: the recovered figure must not appear, the fee must not carry `/yr`, and no internal word (prospect, lead, pipeline, card drop, status) may leak into something meant to be forwarded out of context.

## Verification

`npm run test:recap` — 22 checks, importing the real `.ts` modules through node's type stripper so the figures under test are the ones the email sends.

It caught a real bug: **the business name appeared only in the subject, never in the body.** Wrong for an email that gets forwarded away from its subject line. Now a header line, escaped like every other interpolated value.

Rendered and read end to end in the browser at the real numbers — ~$5,800 + ~$3,200 → ~$9,000/yr cost, ~$1,600 one-time fee.

`npx tsc --noEmit` clean, `npm run lint` 0 errors.

## One fix carried along

`saveVisitEstimateAction` now revalidates `/visit/[id]` as well as `/prospects`. Without it, the page that just saved a visit still showed the *previous* one in the panel.

---

## #54 — feat: a business shows what it was priced at last time
merged 2026-08-22 · `573b51e`

**Stacks on #52** — based on `feature/field-to-client-chain` so the diff shows only 1.2. GitHub retargets to `master` when #52 merges.

Build plan item 1.2. Closes Break 1 from the review: `visit_tasks` had one writer and no readers, so an on-site estimate was unrecoverable the moment you walked out — including when you walked back into the same office three weeks later.

## What it does

`/visit/[id]` opens with a collapsed line: when it was priced, how many tasks, the annual cost. Tapping it lists each task with its minutes, frequency and yearly figure.

The numbers run through `visitTotals` and `annualCost` — the same functions the live panel uses — so a figure quoted in June and re-read in September cannot disagree. Nothing is stored (D21).

## Two things worth knowing

**It reads the most recent visit that actually priced something**, not simply the most recent visit. A plain touchpoint logged from the dashboard creates a `prospect_visits` row with no tasks; reading only the newest one would hide a real estimate behind a two-second door knock.

**Dates are built from the `YYYY-MM-DD` parts, not parsed.** `new Date('2026-08-21')` is UTC midnight and renders as the 20th in Myrtle Beach.

## The bug this caught

`globals.css` has a global `section { padding: clamp(72px, 11vw, 140px) }` for the marketing site, and it applies to **every** `<section>` in the app. The new panel is a `<section>` that didn't opt out, so it first rendered as a 212px box holding one line of text at 375px. `.field-task` opts out the same way; the rule is now written down next to the fix.

## Verification

Local worktree dev server, 375px viewport, against a real prospect:

- panel 130px collapsed, 268px expanded
- both tasks listed with their own annual figures — ~$5,800 + ~$3,200 — summing to the ~$9,000 header
- `aria-expanded` toggles correctly
- `npx tsc --noEmit` clean; `npm run lint` 0 errors

Rendering was verified with a temporary local stub, reverted before commit — production has zero `visit_tasks`, and creating real ones would have left test data in the 88-prospect working list with no in-app way to delete it. The query itself is typechecked but has not run against real rows; the first real saved estimate exercises it.

---

## #53 — chore: port RFQ Hunter's process discipline — push guard, signature gate, generated PR log
merged 2026-08-22 · `3fec197`

Brian's note: the RFQ Hunter process port has been asked for across several sessions and only ever happened piecemeal. This is the systematic pass for the mechanical parts.

## What RFQ Hunter does that core didn't

**1. The push guard was never ported.** core gates *commits* to the default branch (`warn-main-commit.mjs`); nothing gated the *push*. `PORT-push-guard-to-other-projects.md` (2026-08-19) named core as a target and it never happened. The guard handles `main` and `master` both, so only the denial message changed.

**2. Guard hooks ship with tests.** RFQ Hunter's `block-db-sql.mjs` has `block-db-sql.test.mjs`; core's five hooks had no tests at all. `block-main-push.test.mjs` adds 15 cases, all passing.

The PORT note flagged one specific risk — core is worked from git worktrees, so does the guard fight that flow? Tested rather than assumed:

| Case | Verdict |
|---|---|
| `git push -u origin feature/x` from a worktree | allow |
| bare `git push` on a feature branch | allow |
| `ALLOW_MAIN_PUSH=1 git push origin master` | allow |
| `git -C <checkout-on-master> push` | **deny** |
| `cd <checkout-on-master> && git push` | **deny** |
| `git push origin HEAD:master` / `:master` / `feature/x:master` | **deny** |

Worth recording: **the hook always exits 0 and signals denial as JSON on stdout.** Reading the exit code reports every case as allowed — a first pass at this test concluded the guard was dead for exactly that reason.

**3. The signature gate.** core's CLAUDE.md said "act on every file in `docs/__inbox/` ROOT" with no mention of the approval line — the direct opposite of the workspace rule that an unsigned file is inert. Now written out with the owner's actual reason: it's a **scheduling** gate. A signature means "there's session time to do this properly," not just "this is a good idea."

**4. A PR log that regenerates itself.** `scripts/gen-pr-notes.mjs` → `docs/PR-NOTES.md` (`npm run pr-notes`), ported from RFQ Hunter's D97. The workspace's `snapshot.sh` **already looks for this exact filename** and runs it when present — core never had it, so every claude.ai Project snapshot shipped with no PR history. It warned and continued, which is why nobody noticed. 51 PRs captured. Step 0 of the doc-sync pass now regenerates it.

## The principle worth keeping

Anything that can silently drift gets a generator, a gate, or a scheduled pass — never prose someone has to remember to update. PR-NOTES can't drift because it's rebuilt from GitHub. SQL can't bypass the runner because a hook blocks it. And every rule there names the incident that caused it, which is why they survive.

## Also

BACKLOG picks up the two verification items from the 2026-08-21 handoff before it was archived to `docs/__inbox/completed/`.

---

## #52 — fix: the card scan's fields survive promotion to a lead
merged 2026-08-22 · `7657729`

## The bug

`promoteToLeadAction` inserted `business_name`, `industry`, `location`, `phone`, `source`, `stage`, `notes` — and silently omitted `contact_name`, `email` and `website`. All three exist on both `prospects` and `leads`; the card-capture migration (`20260712020000`) added `contact_name` and `email` to `prospects` specifically so OCR had somewhere to land.

So the card was scanned, the fields were confirmed by hand, and then discarded at the exact moment the record starts to matter. Found during the 2026-08-21 review.

## The trap in the fix

`prospects.website` has no constraint and holds whatever OCR guessed — usually a bare domain like `acmeplumbing.com`. `leads.website` carries `leads_website_http` from the security hardening pass (`20260711100000`), which requires `^https?://`.

Copied straight across, a good website would have failed the **entire promotion** with "Creating the lead failed". `toHttpUrl` in `lib/safe-url.ts` adds the scheme when it's missing and returns `null` on anything that still won't parse, so a bad guess costs the URL and never the promotion. It reuses `safeHttpUrl`, so `javascript:` and `mailto:` still resolve to `null`.

## Verification

- `npx tsc --noEmit` — clean.
- `toHttpUrl` checked against the cases card OCR actually produces: bare domain, `www.` prefix, full URL, uppercase scheme, surrounding whitespace, `javascript:`, `mailto:`, empty, null. 9/9 as expected.
- End-to-end promotion not exercised against a real prospect — that needs the dev server and an owner session.

## Also in here

`docs/plans/BUILD-PLAN-field-to-client-chain.md` — the two-week plan this came out of. The window closes 2026-09-07 because field days start the 8th.

---

## #51 — docs: session reconciliation — PRs #41–#50, D21–D23
merged 2026-08-21 · `77a99a4`

`STATUS.md` was seven PRs stale. Closes the gap so a cold start after a few weeks lands somewhere useful.

## STATUS.md

Records the field run that hardened the estimator (#41–#50), written around **causes rather than symptoms** — the 1 MB Server Action body limit, the OS-camera-app overlay constraint, the autofill-service vs browser-extension split, and the `body`-resolves-light-ink dark mode bug. None of those were visible from a desk, and all of them will look mysterious in six weeks.

Also corrects the estimator heading, which named a branch but not PR #40.

## Decisions

- **D21 — estimated figures, firm rate.** Dollar figures are estimates (verbal inputs); the 25% rate is firm and charged once on the first year's savings. Two-row panel, permanent "Rough estimate" tag, disclaimer one tap away. No dollar amount is ever stored.
- **D22 — field copy is the password-manager control on mobile.** The per-vendor attributes work on desktop; on Android the managers are OS autofill services that never see them. The control that works is wording.
- **D23 — the framing guide IS the crop.** In-page camera, guide width and CSS locked together, 0.86 not 0.9.

## BACKLOG.md

Cleared: the 11 ESLint errors (#46) and the Gboard mic check — confirmed working on the handset once Gboard had microphone permission. Sidebar collapse stays but is downgraded now that `/visit` gives field work its own path; the nine remaining lint warnings are logged with why each was left.

Docs only — no code touched.

---

## #50 — fix: dark-mode text inherited light-mode ink; clean up orphaned card uploads
merged 2026-08-21 · `aad9dc1`

## Dark mode

On a portal invoice in dark mode the description read fine while the quantity, rate, amounts and total were almost invisible. Not a token problem — the tokens are all correct.

`body { color: var(--ink) }` resolves **at `body`**, where `--ink` is still the *light* value, because the dark tokens are scoped to `.portal-layout[data-theme="dark"]` — a descendant. `.portal-layout` set `background: var(--bg)` but no `color`, so everything without its own colour inherited dark ink onto a dark background.

That explains the exact pattern in the screenshot: `.data-table td:first-child` has an explicit `color: var(--ink)` and resolved correctly; the mono amount cells inherit, and didn't.

One declaration per themed container fixes the whole class. `.dash-layout` had the identical omission, so the dashboard was carrying the same latent bug. `.field-layout` already set `color`, which is why the field screens were never affected.

## Orphaned card uploads

`saveCardAction` uploads the photo *before* the row write on purpose, so a failed upload never leaves a prospect without its card. The cost of that order is an orphan if the write then fails — and one real orphan turned up in storage, left by the Server Action body-limit crash fixed in #43.

Every early return past the upload now drops the object it uploaded: prospect-not-found, update failure, and insert failure including the dedupe collision. Best-effort — the caller's error stays the one reported.

## Verification

`npx tsc --noEmit` clean, `npx eslint .` 0 errors, `npm run build` passes with lint gating on, `npm run test:estimate` 19/19. Dark mode confirmed against the live portal after deploy.

---

## #49 — fix: a promoted business could not be attached, and the error said it could
merged 2026-08-21 · `083b0dd`

Brian scanned a second card for **Wise Owl**, which he'd already moved to a Lead. The save failed with *"already in the list — pick it in Attach to"* — but Wise Owl wasn't in that dropdown. Both halves were wrong in the same way.

## The chain

`promoteToLeadAction` sets `status = 'lead'`. The field list correctly hides those — they're no longer working prospects. But the card scanner's **"Attach to"** picker was built from that *same filtered list*, so the one record the dedupe index collided with was the one record he couldn't select.

Confirmed against production data: 90 working prospects, 91 on file. The single hidden row is Wise Owl, `status='lead'`, with a `lead_id`.

## Fix

1. **Attach targets get their own query** over every business, independent of what the list shows. Promoted and archived ones sit in an `Already promoted or archived` optgroup so the working set stays the obvious pick.
2. **Same fix on the dashboard scanner** — its list is filtered by the active tab, so it had the identical hole from a different direction.
3. **The dedupe message now names the business and says where the record went** — "Wise Owl is on file — already promoted to a Lead. Pick it under "Attach to" to put this card on that record." Instead of advice that couldn't be followed.

## Verification

`npx tsc --noEmit` clean, `npx eslint .` 0 errors, `npm run build` passes with lint gating on, `npm run test:estimate` 19/19. The hidden-row arithmetic was checked against the live database rather than reasoned about.

---

## #48 — feat: in-page card camera with a framing guide that is the crop
merged 2026-08-21 · `4a7532b`

Cards came back with the whole desk around them. Option C from the discussion — fix the framing rather than repair the photo afterwards.

## One correction to what I told Brian

I said this would be "nearly free". It isn't, and the reason matters: `<input capture="environment">` hands off to the **phone's native camera app**, where nothing can be drawn over the viewfinder. A framing guide requires owning the preview, which means an in-page camera.

That turned out to be the better version anyway.

## The guarantee

The guide rectangle and the crop are **the same region by construction**, not by coincidence:

- The `<video>` box keeps the stream's intrinsic ratio — `width: 100%`, height auto, no `max-height`, no `object-fit` letterboxing — so displayed pixels map to intrinsic pixels by a single scale factor.
- `drawImage` cuts the centred `GUIDE_WIDTH` rectangle at 3.5:2, the same values the CSS draws.

What you line up is exactly what is kept. No edge detection to misfire, no manual crop step while a prospect watches.

## Why 0.86 and not 0.9

At `GUIDE_WIDTH = 0.9`, a 3.5:2 crop is **taller than 90% of a 16:9 frame** — the commonest phone rear-camera stream — so the safety clamp fired and silently shrank the crop away from the rectangle drawn on screen. A 1.6% mismatch nobody would notice until a card edge went missing.

Checked before picking the number:

| stream | guide 0.90 | guide 0.86 |
|---|---|---|
| 16:9 | clamp fires ❌ | clear ✓ |
| 4:3  | clear ✓ | clear ✓ |

The CSS width and `GUIDE_WIDTH` must stay equal; both carry a comment saying so, because changing one alone breaks the guarantee silently.

## Fallback

Camera access can be denied, unavailable, or blocked by a locked-down browser. That falls back to the existing file input rather than erroring — a refused permission in someone's lobby must not end the visit.

## Verification

`npx tsc --noEmit` clean, `npx eslint .` 0 errors, `npm run build` passes with lint gating on, `npm run test:estimate` 19/19.

The camera path itself needs a real device with a real camera — Brian's next field run. The fallback path is what I can exercise from here, and it's the one that matters if permission is refused.

---

## #47 — fix: card scan opens the visit screen, one-time fee, and the lead pipeline's dead ends
merged 2026-08-21 · `77c55c3`

Four things Brian hit using the field kit and the lead pipeline for real.

## Field

**Scanning a card left him on the list.** He had to search for the business he'd just added. The manual add already jumped straight into the visit screen, and scanning a card is the same intent — you're capturing it *because* you're about to price their tasks. `saveCardAction` now takes a `go_to_visit` flag, so the field flow lands on `/visit/<id>` (new business or attached to an existing one) while the dashboard flow stays put, which is desk work.

**The fee row said `/yr`.** The fee is charged once, calculated on the first year's savings. Sitting next to two `/yr` figures it read as recurring — an error in the *client's disfavour*, which is the worse direction for a pitch built on "no savings, no fee". Now reads **"My fee — one time"** with no suffix, and the disclaimer says "charged once, not every year".

## Leads

**`cursor: pointer` on every row while only the first cell was a link.** The row promised to be clickable and wasn't. The first cell's anchor is now stretched across the row with CSS only — no JS, no client component, and it stays a real anchor so keyboard focus and middle-click still work. Links in other cells sit above the overlay so `mailto:`/`tel:` are unaffected. This fixes **every** `.data-table` in the dashboard, not just leads.

**"Move to Meeting Scheduled" scheduled nothing.** It changed a label with nowhere to record *when*. It now books a date into `follow_up_date` — the field the leads list already sorts on and flags overdue in red.

**A stage moved by accident was a dead end.** Only a *lost* lead could be reopened; every other stage was one-way. There's now a **Set stage** control covering all six, so a mis-click is one correction rather than a support call for Brian or a future employee. Advancing stays a single button so the happy path is unchanged.

`setStageAction` also no longer wipes `lost_reason` when a stage is corrected by hand.

## Verification

`npm run build` passes with lint gating on, `npx tsc --noEmit` clean, `npx eslint .` 0 errors, `npm run test:estimate` 19/19.

## Not in this PR

Cropping the card photo — real work with a genuine design choice behind it, so it gets its own discussion rather than a guess.

---

## #46 — chore: clear the lint errors and gate builds on lint again
merged 2026-08-21 · `6e1ad98`

Clears the pre-existing lint errors and removes `eslint.ignoreDuringBuilds`, so lint gates the build again — the point of adding the config in #40.

## It was 7 errors, not 11

My earlier count was wrong, and worth explaining because the cause is non-obvious.

The `@next/next` rules report **twice** when ESLint runs inside a worktree nested under the main checkout: `no-html-link-for-pages` walks candidate page roots, finds two `app/` directories, and reports once per root. I confirmed it wasn't a config problem by reproducing it with a single hand-registered plugin instance rather than FlatCompat. The config is fine; the number was an artifact of where I ran it.

## Changes

**Four `<a>` → `<Link>`** (`components/home/Stories.tsx`, `components/landing/IndustryLanding.tsx`). These are genuine navigations to app routes, so they're now client-side transitions instead of full page reloads — a small improvement on the marketing pages, and the reason this was kept out of the feature branches.

**Three unescaped entities** (`app/(dashboard)/cleanup/page.tsx`, `components/portal/ApproveProposal.tsx`). Used typographic quotes (`&ldquo;` / `&rdquo;` / `&rsquo;`) to match what the codebase already uses rather than straight-quote escapes.

**`next.config.ts`** — `eslint.ignoreDuringBuilds` removed.

## Left alone deliberately

Nine warnings remain and don't block: unused vars (3), one `react-hooks/exhaustive-deps` in `ThemeToggle`, two `no-img-element`, one stale eslint-disable directive. The exhaustive-deps one changes runtime behaviour if "fixed" carelessly, and none of them belong in a commit about errors.

## Verification

With lint gating **on**: `npm run build` passes, `npx eslint .` reports 0 errors, `npx tsc --noEmit` clean, `npm run test:estimate` 19/19.

The marketing pages are worth a look after deploy since the link behaviour changed — `/` , `/work`, `/papers`, and an industry landing page.

---

## #45 — fix: LastPass opened on the task-name field — the placeholder said "email"
merged 2026-08-21 · `4ea76e0`

Brian: LastPass still popped after #42, **and only on the "What is it?" field**. That last detail is what identified it.

## Cause

That was the only field on the screen whose placeholder contained the word `email`:

```
placeholder="Retyping vendor invoices from email"
```

Password managers classify a field by the words around it — label and placeholder text scanned for `email`, `user`, `login`, `password`. One word made the task-name box look like an email field. Nothing else about the input differed from its neighbours.

## Why #42's attributes couldn't have worked

On Android, LastPass runs as an **autofill service** through the OS framework, not as a browser extension. The framework never sees `data-lpignore`, `data-1p-ignore` or the others — those are extension-only. The attributes were present and correct the whole time (verified in the live DOM) and were simply inert on a phone.

So the attributes stay for desktop, and the real control on mobile is **copy**. That's now documented in `lib/field/no-autofill.ts` rather than left as folklore: keep `email` / `user` / `login` / `password` / `admin` out of every placeholder and label on a field screen unless the input really is that thing.

## Changes

- `"Retyping vendor invoices from email"` → `"Retyping vendor invoices by hand"`
- `"Sherri, office admin"` → `"Sherri at the front desk"` (weaker username trigger, same class)
- Swept every field placeholder for the keyword set — none left.

## Verification

`npx tsc --noEmit` clean, `npm run build` compiles, ESLint clean.

The real test is Brian tapping that field on his phone — the mechanism is Android's autofill service, which I can't reproduce from here. Saying that plainly rather than claiming it fixed.

---

## #44 — feat: two-row estimate panel, and add a business by hand
merged 2026-08-21 · `0b3158e`

Two things from Brian using `/visit` in the field.

## 1. The estimate panel ate ~40% of the phone screen

Collapsed to the two numbers that make the point — **what the task costs now** and **my fee**. That reads as one clear gap in the owner's favour. Three rows invited arithmetic; two invite a reaction.

Tapping the panel reveals the recovered figure and the full disclaimer. The honesty rail is one tap away when someone questions the numbers, instead of occupying the screen for the whole visit. The **"Rough estimate" tag stays visible at all times** — that part of decision 6 isn't behind a tap.

Cost is the dominant number, not the fee. I built it the other way first, which sold the wrong thing: the owner should see what the task bleeds, with a smaller fee beside it.

## 2. No way to add a business without a card

Most people Brian talks to have no card — someone meets him at the desk, gives a name, and that's all he gets. The field home had only the camera and the list of businesses already on file, so that conversation had nowhere to go.

Now: **"No card? Add the business by hand"**, collapsed by default so the camera stays the obvious first move. Business name is the only required field. Saving jumps **straight into that business's visit screen**, because the reason he's typing it in is that he's about to price their tasks. Status starts at `visited` — he's standing in the building.

Re-adding a business already on the list gives a real message ("… is already on your list — find it below instead") rather than a silent failure, since the dedupe index would reject it.

## Verification

`npm run test:estimate` 19/19, `npx tsc --noEmit` clean, `npm run build` compiles, ESLint clean on all touched files.

---

## #43 — fix: card save crashed on real phone photos (1 MB Server Action limit)
merged 2026-08-21 · `67da798`

Brian photographed a card in the field — OCR worked well — then hit Save and got `Application error: a client-side exception has occurred`. Nothing was created.

## Cause

Next.js caps Server Action request bodies at **1 MB by default**, and that was never raised. A phone camera photo is 3–6 MB, so the request was rejected before `saveCardAction` executed. The `photo.size > 12 MB` check inside the action never got a chance to return a useful message, and the rejection surfaced as a bare client-side exception.

This has been latent since card capture shipped (D20, PR #34). It never surfaced because `/prospects` was unusable on a phone, so no real camera photo had ever been submitted.

## Fix — smallest hammer first

1. **Downscale in the browser before OCR and upload** — `lib/field/downscale.ts`, 1600px long edge, EXIF orientation applied so a portrait card isn't stored sideways. ~200 KB instead of megabytes. This is the real fix: sending 5 MB over one bar of cell signal is the wrong shape regardless of the limit. Applied to both the field and dashboard scanners.
2. **`bodySizeLimit: '12mb'`** as a backstop, matching the action's own check so the two can't disagree again.
3. **`app/(field)/error.tsx`** — these screens fail in someone else's lobby with the owner reading over your shoulder. "That didn't save" plus a Try again button beats Next's default "Application error".

## Also

- `saveCardAction` only revalidated `/prospects`, so a card saved from the phone left `/visit` stale even on success. Now revalidates both.
- ESLint caught two `<a>` links to `/visit` that should be `<Link>` — one of them mine from #41. The lint config added in #40 is already paying for itself.

## Verification

`npm run test:estimate` 19/19, `npx tsc --noEmit` clean, `npm run build` compiles, ESLint clean on all touched files.

The downscale path needs a real camera photo to exercise properly, which is Brian's next field run — the code falls back to the original file on any failure, so the worst case is the previous behaviour with a 12 MB ceiling instead of 1 MB.

---

## #42 — fix: password managers in field forms, editable contact name
merged 2026-08-21 · `893c033`

Two findings from Brian's first real run of `/visit` on his phone.

## 1. The password manager opened on "What is it?"

Nothing on a field screen is a credential — it's a task description, a count, someone else's phone number. But password managers heuristically offer to fill *and to save* any bare text input, and a vault popup covering the screen while an owner is watching you work kills the demo.

`autocomplete="off"` alone is widely ignored, so `lib/field/no-autofill.ts` carries the per-vendor opt-outs (1Password, LastPass, Bitwarden, Dashlane) and is spread onto every input on every field screen.

That includes the card-scan fields, deliberately: those hold the **prospect's** business name, email and phone, so autofilling Brian's own details there would be actively wrong, not just annoying.

## 2. No way to record who you're talking to

Contact name is now an editable field on the visit screen ("Who are you talking to?"), saved with the visit.

Brian's read was that card capture would cover it, and for a business with a card it does. But most of his list came in through the My Maps KML import and has no contact name at all — and if someone meets you at the desk without a card, there was nowhere to put the name.

A name typed here overwrites, unlike OCR guesses which never overwrite (D20). Blank still never clobbers an existing name.

## Verification

`npm run test:estimate` — 19/19. `npx tsc --noEmit` clean, `npm run build` compiles, ESLint clean on all touched files.

---

## #41 — feat: field home at /visit — phone list and a real camera button
merged 2026-08-21 · `2e96fc7`

Follow-up to #40. Brian couldn't use `/prospects` on his phone, and never managed to photograph a card.

## Why

Two concrete blockers, both confirmed:

1. **`/prospects` is unusable on a phone.** `app/(dashboard)/layout.tsx` has a fixed 220px `.dash-sidebar` and no media query in `globals.css` collapses it — ~170px of content at 390px.
2. **Card capture is invisible.** `CardScan` already sets `capture="environment"`, so the camera does open — but the trigger is a bare `<input type="file">` inside a collapsed `<details>`. It renders as a small "Choose File" control that's easy to miss standing in someone's lobby.

## What's here

- **`/visit`** — the field home, in the existing `(field)` shell: no sidebar, full width.
- **A full-width "Take a photo of a card" button**, plus a separate library picker for a photo already taken. Same engine as the dashboard's `CardScan` — `tesseract.js` in the browser, `parseCardText` guesses, `saveCardAction` to save — only the trigger and layout differ.
- **Client-side search** over the working list (untouched / visited / interested). Filtering in memory rather than per-keystroke round trips, because the list is short and one bar of signal in a parking lot is the operating condition.
- **Tap a business → straight into the visit estimator.** The estimator's back link now returns to `/visit` rather than the sidebar-bound dashboard page.

Desktop `/prospects` is untouched apart from one line pointing at the phone version. Chosen over collapsing the sidebar globally, which would touch all 15 dashboard pages.

## Verification

`npx tsc --noEmit` clean, `npm run build` compiles both `/visit` and `/visit/[id]`, ESLint clean on all new code. Behaviour verified against this PR's Vercel preview — see the comment below.

---

## #40 — feat: on-site visit estimator
merged 2026-08-21 · `075e27e`

Prices a prospect's repetitive tasks out loud during a drop-in, on a phone, while the owner watches the annual figure build. Per `docs/plans/DESIGN-BRIEF-visit-estimator.md` (six locked decisions) and `BUILD-PLAN-visit-estimator.md`.

Half the original idea already shipped on 2026-07-12 as D19/D20 — card OCR, prospect record, private photo bucket. This adds only the task pricing and the screen to do it on.

## What's here

- **`/visit/[id]`** in a new `(field)` route group with its own full-bleed layout. The dashboard's fixed 220px sidebar has no mobile collapse, leaving ~170px of content at 390px — unusable for a screen someone reads over your shoulder. Same owner-only auth gate, duplicated rather than shared (~15 lines against restyling 15 shipped pages).
- **`visit_tasks`** (migration `20260820000000`, already applied): label, who, minutes each, times per week, hourly rate. CHECK bounds mirror `set_value_inputs` exactly ($5–$500/hr, 0.5–480 min). Owner-only RLS, no client policies (D8). **No dollar amounts stored** — money is derived on read, so changing a rate can't leave stale money behind.
- **`lib/field/estimate.ts`** imports `HAIRCUT` and `formatDollars` from `lib/portal/value.ts`. A test asserts it *is* the portal's constant, so the field number and the portal number can't drift.
- **Three money lines**: costs now, recovered after the 30% haircut, and the 25% fee — with a permanent "Rough estimate" tag and a note separating the estimated figures from the firm rate.
- **`saveVisitEstimateAction`** writes a visit plus its tasks all-or-nothing (deletes the visit if the tasks fail — a half-saved visit looks complete, which is worse) and never walks a status backward.

## Verification

`npm run test:estimate` — **19 checks, all green.** Math plus database: CHECK constraints reject $4/$501 rates and 0.25/481 minutes, an in-bounds task saves, deleting a visit leaves its tasks with a null `visit_id`, the anon key reads nothing (RLS), deleting a prospect cascades.

Driven end to end at 390px against a real prospect: no horizontal overflow, no sidebar, sticky total, ~$5,800 / ~$4,100 / ~$1,000 on the worked example, two tasks summing to ~$7,800, a real save that flipped the prospect to `interested`. Unauthenticated requests to `/visit/[id]` redirect to `/login`. Test data removed and the prospect restored afterward.

## Two things reviewers should know

1. **ESLint is now configured** (`eslint.config.mjs`) and `npm run lint` uses the ESLint CLI, since `next lint` is deprecated. **Build gating is deliberately off** (`eslint.ignoreDuringBuilds`): 11 pre-existing errors in shipped files would fail production deploys the moment the config landed. Logged in BACKLOG.md with the file list.
2. **`tsconfig` gains `allowImportingTsExtensions`** so `estimate.ts` can import `'../portal/value.ts'` with the extension node's type stripper requires. Inert for the build (`noEmit` was already true) — verified with a full `npm run build`, not just `tsc`.

## Not covered

The Gboard mic split on the real handset (mic on the text fields, absent on the numerics). Logged in BACKLOG.md alongside the sidebar collapse and the lint cleanup.

---

## #39 — Meeting notes on client detail + overnight-batch docs
merged 2026-07-12 · `b720226`

- **Meeting notes**: dated running log on each client ("what did we say last time"), quick-add + list, owner-only RLS (migration 20260712030000, applied). Distinct from evergreen relationship notes.
- Suite grows to 47 (client role sees zero meeting notes).
- **BACKLOG.md + STATUS.md** updated for the whole overnight batch (PRs #34–#39), including the finding that the lead-funnel finish was already fully built in LeadDetail — removed rather than duplicated.

---

## #38 — Three backlog small wins: referral field, proposal win rate, content sweep
merged 2026-07-12 · `fc61550`

- **Referred by (who to thank)** on the new-lead form — `leads.referred_by` existed and the action read it, but no input rendered it.
- **Proposal win rate** in the page header: "N won of M decided (X%)" — pending proposals aren't counted as wins or losses.
- **Content sweep**: the drafts' last stale "Murrells Inlet" phrasing now matches the live site's Lowcountry-to-Myrtle-Beach framing. Closes the location item for good.

---

## #37 — Document PDF export: dead button becomes Print / PDF
merged 2026-07-12 · `6eae3fe`

The stubbed "Download PDF" on document pages (dashboard and portal) is now a working **Print / PDF** button: print CSS isolates the document (app chrome, action buttons, and dark mode all step aside; paper forced white), and the browser print dialog's Save-as-PDF produces the file with the brand typography intact. Zero dependencies. A dedicated PDF renderer can supersede this later if pixel-perfect output is ever needed.

---

## #36 — Email templates: five house emails, fill once, copy
merged 2026-07-12 · `be95976`

The written follow-up engine, pre-loaded: field-day thank-you (references the handwritten card word and its landing page), proposal follow-up, assessment confirmation, invoice reminder, and project completion. One set of fill-in fields updates all five live; each copies subject + body in one click. No schema, no deps.

---

## #35 — Follow-ups due panel on Overview
merged 2026-07-12 · `1b42004`

Leads with a follow_up_date within 7 days — or overdue, shown in red — now sit at the top of Overview, each linked to its lead. Won/lost stages excluded. Uses the existing section-card/data-table idioms; no schema change (the column already existed, nothing surfaced it).

---

## #34 — Business-card capture: snap, OCR in-browser, confirm, save
merged 2026-07-12 · `35dec38`

Owner request: photo of a business card → attached to a prospect → data scraped into the DB.

- **Scan a business card** fold on /prospects: phone camera or file picker.
- OCR runs **in the browser** (tesseract.js, $0) — nothing leaves the device until the confirm step.
- Heuristics pull person, business, email, phone, website (unit-tested; the guesses land in an **editable form** — nothing saves unconfirmed, D20).
- Save uploads the photo to a **private, owner-only `cards` bucket** and either creates a prospect or back-fills blanks on an existing one (dropdown). Photos render on the card via 1-hour signed URLs.
- Migration 20260712020000 applied; suite now 46/46 (client role sees nothing in the bucket).

---

## #33 — Open-in-Maps link on prospect cards
merged 2026-07-12 · `ad1a6ae`

Each prospect card now links to Google Maps — coordinates when the pin came from the map import, name+address search for manual entries. Opens the Maps app on a phone: open the card, tap, navigate.

tsc clean; presentation-only change inside the existing client component.

---

## #32 — Dashboard dark mode: sidebar toggle + softened-dark tokens
merged 2026-07-12 · `71832cb`

Owner request (screen fatigue): the portal's softened-dark theme extended to the owner dashboard.

- Moon/sun toggle in the sidebar footer, next to "Ridgeline · Internal".
- Own preference key (`rk-dash-theme`) — portal and dashboard remember separately; system dark is the default when unset.
- Pre-paint script so no wrong-mode flash; same warm-dark tokens as the portal (glare-kill, contrast kept) scoped to `.dash-layout`; nav hover/active, table hover, and error colors given dark counterparts.
- Marketing site and login stay light (D6's scope extended by owner request).

tsc clean. Dashboard requires an owner session, so the visual check is Brian's — it's live on localhost:3000 right now on this branch.

---

## #31 — Field kit v1: card drops + My Maps import + promote-to-lead
merged 2026-07-12 · `d91b18d`

The field-day kit (D19), built overnight per owner's "build what you can":

- **/prospects — Card Drops** (in the sidebar, next to Leads): phone-first stacked cards, quick-add tuned for a parking lot (name + industry is enough), per-visit log with date + **which card word you handwrote**, status flow (untouched → visited → interested → promoted/archived).
- **Google My Maps import**: export the Drop-Ins map as KML, drop it in the import box — every pin becomes a prospect, layers become industries. Re-import skips what's already there (dedupe index); a KMZ is refused with instructions to re-export as KML.
- **Promote to lead**: one click creates the Lead (source: card drop, stage: identified) and links back; the prospect card shows Lead ✓.
- **BACKLOG.md** re-sorted per tonight's review: three items deleted on owner's call (scaffold-link, billing-framed time tracking, location reframe), time tracking preserved as his future profitability note, ✅-built items cleared, autonomy tags added.
- Migration 20260712010000 **already applied**; suite now 45/45 including client-sees-nothing checks on both new tables.

Verified: tsc clean, KML parser unit-tested against a mock of the real map's structure (folders, CDATA, entities), suite green, route live (307 to login for anonymous). The logged-in page needs your eyes — my browser has no owner session.

---

## #30 — Ingest-key reveal: copy buttons, single-line key, separated example
merged 2026-07-12 · `e7c79c6`

Fixes the three findings from tonight's n8n lesson: the one-time key wrapped across ~5 lines, selecting it also grabbed the adjacent sample curl (which cost us a debugging round), and there was no copy button.

- Key renders on one non-wrapping, scrollable line with a **Copy key** button (visible "Copied ✓" confirmation; on clipboard failure the label doesn't lie).
- One-line n8n hint: Header Auth → Name `Authorization`, Value `Bearer ` + key.
- Example curl moved into its own bordered block labeled "for reference, not part of the key," with its own **Copy example** button.

tsc clean. The reveal only renders after a key rotation, so it wasn't exercised against the live demo client (rotating would kill Brian's working lesson key); the change is presentation-only within an existing client component.

---

## #29 — Client-owned value inputs: rate + minutes-per-task in the portal
merged 2026-07-12 · `d0ab53d`

The rate read as hard-coded because it effectively was (default 45, no edit surface anywhere). Now the savings math runs on the client's own numbers — which makes the honest math unarguable (D18).

- **"Your numbers"** form inside the portal's *How I count this* panel: blended hourly rate + minutes-per-task for each running automation.
- **Bounded RPC** `set_value_inputs` in the house pattern (SECURITY DEFINER, client role + own tenant enforced in-DB, rate $5–$500, minutes 0.5–480, no RLS loosening). The 30% haircut still applies on top of whatever they enter.
- Owner preview shows the form read-only; the copy in How-I-count now says the rate is "a number you can change below."
- Suite: 6 new checks (own-rate set + landed, out-of-bounds refused, foreign automation refused, own minutes set, anon refused) that **skip with a notice until the migration runs**.

**Merge order:** `npm run migrate` first (applies 20260712000000), then merge. Suite goes 42/42 after.

---

## #28 — Industry-first hero + research fold-in for the last seven verticals
merged 2026-07-12 · `cb16184`

Fixes the owner's finding: **the target industry didn't jump out**. The industry name is now the hero's dominant element — wordmark-scale blue italic serif above the hook line — so a broker landing on /real sees *Real estate.* before anything else. The eyebrow now carries "Operations & automation" since the industry moved into the H1.

Also folds the final seven research reports into their pages:
- **/med** — eligibility re-verified and still denied, denials as earned money walking away, the recall list nobody calls, clipboard-to-chart retyping.
- **/food** — new headline: "Your POS, your books, and your bank should already agree by the time you get home." Schedule + callouts, invoice shoebox, re-keyed sales, three filings due the 20th.
- **/boats** — new headline: "Your crew is great with a wrench. The paperwork is what's killing the season." Spring renewal fire drill, sticky-note work orders, Saturday double-bookings, entered-twice books.
- **/shop** — new headline: "Sunday night shouldn't be for figuring out why the bank doesn't match the register." POS re-keying, July oversells, buying-in-your-head, filings + drawer counts.
- **/mfg** — new headline: "You're the best estimator in the building. So why are you quoting at 9 p.m.?" One-in-three quote economics, paper travelers, shipment-day cert scrambles, four-screen re-keying.
- **/books** — capacity-ceiling lede ("the reason you keep saying I can't take another client"), circling-back chase, PDF re-typing, status-in-your-head, the 20th across tourism clients.
- **/firms** — new headline: "You sell hours. The paperwork shouldn't be eating them off the invoice." Time reconstructed from memory, intake retyping, last-client document editing, status-call interruptions.

All 12 verticals + pulse-check verified rendering the new hero on the dev server; tsc clean; test suite 36/36.

---

## #27 — Landing research fold-in: real, trades, home
merged 2026-07-11 · `33bd438`

Second research wave from `_inbox/research/landing/` into the card-word pages.

- **/real**: deadlines-by-memory (earnest money + Friday-closing stakes), the 9 p.m. Saturday lead answered Monday, closing-day split/CDA/QuickBooks math, same-deal-three-systems re-keying.
- **/trades**: headline sharpened to the researched #1 pain (chasing your own money); draw kicked back over one missing waiver + SC 90-day lien clock; job costs surfacing at closeout; kitchen-table bids; retainage waiting on sticky-note punch items.
- **/home**: new headline from the report's central finding — "The work gets done. The money leaks out the seams." Unbilled extras, untracked maintenance plans/expired cards, invoice aging into the slow season, failed truck rolls.
- New aliases: /pools /pest /plumbing /lawn → /home, /builders → /trades (handwrite the shop's own word).
- `reviewLabel` keeps HVAC uppercase in the reserved-review sentence.

No vendor hour-claims on any page (the reports themselves flag them). Verified: tsc clean, all three pages render the new copy on the dev server, alias 308s confirmed.

---

## #26 — Industry landing pages: 12 card words + pulse-check + 404 net
merged 2026-07-11 · `254b4b0`

The card-word system (D17). Back of the business card reads `ridgelineknows.com/___________`; the handwritten word loads a targeted page.

- **12 SSG routes** from one template: /vrm /pm /real /trades /home /med /food /boats /shop /mfg /books /firms — per-industry headline, pains, contact-form options.
- **Pages, not redirects**: per-word analytics + SEO. Aliases (/vacation /hvac /cpa /marine …) and any-case variants 308 to the canonical word.
- **Sample portal dashboard** rendered live in the site's design language beside the portal promise line — visible "Sample data" chip, no invented client claims.
- **Reserved review**, not a fake one: the disclosure is the attribution line itself.
- **/customer-pulse-check**: the generic 13th page; **404 word net** catches typos and lists the real words.
- Contact form: per-page situations + `Page:` attribution into leads and the notification email.
- Reveal animation: no-JS + prefers-reduced-motion fallbacks (content never unreachable).

Verified: tsc clean, production build compiles (all 12 prerendered), test suite 36/36, dev-server checks (308s, 404 net, home unchanged).

---

## #25 — Edit forms exit to the refreshed view on save
merged 2026-07-11 · `6e70a9b`

Owner report on project edit; the same latent behavior existed on clients and proposals. Save now redirects to the view (the assessment-form precedent), where the fresh values are the confirmation.

---

## #24 — Document delete on the index + document page (two-step confirm)
merged 2026-07-11 · `defb7fe`

The All Documents index gains a per-row Delete (two-step confirm); the document page gets Delete beside Edit, returning to the parent record. Delete refreshes the index; case-study action notes that each click mints a new draft.

---

## #23 — Doc sync: punch list (D16)
merged 2026-07-11 · `77fe115`

Authorities reconciled after PR #22.

---

## #22 — UAT punch list: forms, provisioning, spacing, rates, deliverables, doc editing
merged 2026-07-11 · `8acca41`

Owner's walkthrough punch list, all eight areas. Root causes over symptoms: the section gaps were Chrome's closed-details layout ghosts (global fix); deliverables had an action nothing rendered; the portal-access checkbox now actually provisions. Suite green 36/36 after.

---

## #21 — Test-suite commands from both roots + npm script
merged 2026-07-11 · `15de2e8`

Owner hit MODULE_NOT_FOUND running from the workspace root; the header, an npm script, and the test plan now carry the exact working forms (verified: workspace-root invocation runs green).

---

## #20 — Lifecycle connectors + standing test gate (D15) — suite green 36/0
merged 2026-07-11 · `a77f46d`

The module-model recommendations implemented (assessment→proposal→project thread, portal proposal approval, request→roadmap, lifecycle nav) plus the automated test suite that gates every future walkthrough: 36 checks across security, isolation, ingest, and stress — all green against the live stack.

---

## #19 — Fix dead create-login button (nested forms)
merged 2026-07-11 · `2891c16`

Owner report: clicks did nothing, no pending state. Root cause: the create form was nested inside the change-email form and browsers discard nested forms. Now sibling forms. (The login the owner saw after reload was created server-side during diagnosis.)

---

## #18 — Portal-login panel names its failure modes
merged 2026-07-11 · `ed1a394`

Owner hit 'does not work' on prod while the same call succeeds with the local key — a rejected/miswired key was hiding behind the create form. Each failure mode now speaks: missing key vs rejected key, with the exact remediation.

---

## #17 — One-click portal-login creation (provisioning automated)
merged 2026-07-11 · `ede3507`

The Portal login panel's missing half: create the client auth user (role + client_id stamped) with a one-time password. Closes the manual-provisioning register item; runbook stays as fallback.

---

## #16 — Owner-administered portal login email (change + dual notification)
merged 2026-07-11 · `160ca99`

Owner ask: change a client's LOGIN email from an admin screen, with an optional notification. Implemented with the security-standard dual notice (old + new address), magic-link guidance in the email, and an optional contact-email sync. Dark until SUPABASE_SECRET_KEY is set — the panel explains itself.

---

## #15 — Intake submit scrolls to the confirmation
merged 2026-07-11 · `29bf74e`

Owner report: the thank-you rendered above the fold while the viewport sat at the submit button — looked like a blank screen.

---

## #14 — Assessment save feedback + intake client pre-fill (owner reports)
merged 2026-07-11 · `78bd8be`

Two live-demo findings: the assessment edit button discarded action state (silent save/failure, no exit from edit mode) — now a proper useActionState form that redirects on success; and the public intake now pre-fills a known client via a bounded intake_context RPC, so clients never type their own company name. Migration applied via the runner.

---

## #13 — One-paste walkthrough seed (Coastal Cottage Rentals demo)
merged 2026-07-11 · `83af06b`

Replaces the manual demo setup with one runner command; already applied and count-verified against the DB.

---

## #12 — Doc sync: magic link verified
merged 2026-07-11 · `cf2edc0`

SMTP wired, link delivered, sign-in verified same-browser. The email-template edit (activates /auth/confirm) remains the one open BACKLOG step.

---

## #11 — Browser-independent magic-link confirm route
merged 2026-07-11 · `2397c96`

verifyOtp(token_hash) route per Supabase's SSR pattern — magic links stop being bound to the requesting browser once the email template points at /auth/confirm (BACKLOG owner step). Open-redirect guard matches the callback.

---

## #10 — BACKLOG.md to repo root (fleet convention)
merged 2026-07-11 · `2698d80`

It was buried under docs/extras/ideas/ from the old taxonomy era; the Kit and RFQ Hunter both keep BACKLOG.md at the root.

---

## #9 — Doc fix: magic-link blocker named correctly
merged 2026-07-11 · `d16116b`

Supabase's built-in mailer only delivers to project-team addresses and mislabels other recipients as invalid; the register and STATUS now say so.

---

## #8 — Client-lifecycle wave: intake → proposal → portal → reports → case study (D14)
merged 2026-07-11 · `bace5e6`

All nine future-features, lean v1s, per docs/plans/BUILD-PLAN-client-lifecycle.md. Everything client-triggered ships dark (cron flags default off, admin client 501s until its env exists). Demo script at docs/extras/demo-walkthrough.md.

---

## #7 — Monthly report email v1 (owner-triggered, D13)
merged 2026-07-11 · `2ceeb86`

The portal's retention loop completes: an owner-triggered monthly report with the dashboard's exact numbers (one data model, three views), sent via Resend REST per house email conventions. Includes the BACKLOG email/ops items (SMTP-via-Resend steps + Google Workspace migration checklist). Cron deferred with an explicit trigger.

---

## #6 — Doc sync: activity ingest shipped (D12, register strikes)
merged 2026-07-11 · `bd978f8`

Authorities reconciled after PR #5: D12 recorded, activity-ingest + nav-overflow register items struck, STATUS shipped section updated.

---

## #5 — Activity ingest (n8n-shaped) + owner portal-data screen
merged 2026-07-11 · `66a21c8`

The portal goes production-real: per-client bearer-key ingest (authorization inside a bounded SECURITY DEFINER function, no service-role key in the app; round trip verified locally incl. 401 paths) and an owner screen managing automations, activity, issues, roadmap, highlights, and the ingest key. Folds in the portal-nav overflow fix. Migration 20260711200000 applied via the runner. Plan: docs/plans/BUILD-PLAN-activity-ingest.md.

---

## #4 — Drop the legacy Supabase key fallback (new keys only)
merged 2026-07-11 · `deb1c5b`

Legacy API keys were disabled in the Supabase dashboard today; prod and local verified working on the publishable key alone before this removal. keys.ts becomes new-keys-only; STATUS + decisions-log register updated (D9 closed).

---

## #3 — Ops retrofit: core runs the fleet's operating system (D11 + ADR-003 consequences)
merged 2026-07-11 · `d63525f`

Core adopts the Genesis Kit / RFQ Hunter operating discipline: CLAUDE.md + session hook, the D#-table decisions log (docs/decisions-log.md, D1-D11), the doc-sync skill, six guard hooks, inbox lanes, and Scheme B naming. Stale taxonomy-era docs + the communications stub + the in-app Scaffolder (it shelled out to the workspace script retired by ADR-003) moved to untracked docs/__retired/ for owner review — nothing deleted.

Verify: tsc clean; CI build runs on this PR. Hooks take effect on the next session start.

---

## #2 — Portal home dashboard, request log, magic link, dark theme + security hardening
merged 2026-07-11 · `10f441d`

## What this is

The client portal's missing home page — the ten-second screen — plus the written request log, magic-link sign-in, a softened-dark portal theme, the Genesis Kit migration runner, and a security-hardening pass from a four-agent adversarial review.

Spec: docs/plans/BUILD-PLAN-portal-home-dashboard.md · Decisions: docs/decisions/ADR-100-portal-value-layer.md · Research: workspace _inbox/research 14 & 15.

## Feature summary

- **/portal** is now a value dashboard (was a redirect): health banner, hours/dollars/issues scoreboard with 'How I count this' honest math (30% haircut, code layer), peace-of-mind card, caught & fixed log, what's next, Request a change. Owner preview with explicit client picker, labeled.
- **Value schema** (migration 20260711000000): automations, automation_activity, caught_issues, roadmap_items, change_requests, portal_highlights + clients.blended_labor_rate. RLS on app_metadata; explicit GRANTs; fixes client-invisible project/client shared documents.
- **Requests**: portal submit (identity derived from session, never the form) ↔ owner reply on /requests.
- **Magic link** (shouldCreateUser: false) + role-aware callback.
- **Dark theme**: portal-scoped tokens, system default, toggle, no flash.
- **Migration runner** (scripts/run-migration.mjs, from RFQ Hunter): `npm run migrate`; never hand-paste SQL again.
- **Demo data**: scripts/seed-portal-demo.sql, clearly labeled, one DELETE removes it.

## Security hardening (ADR-100 §9)

Deny-by-default roles (explicit `role='owner'` in code and every RLS policy; migration 20260711100000 stamps existing users) · auth-callback open-redirect guard · http(s)-only lead links (render guard + CHECK constraints) · real SQL counts + portal_value_raw aggregate (no silent truncation) · change_requests insert pinned to status='new' · anon default grants revoked + RLS on schema_migrations.

## Before merge (owner)

- [ ] Add DATABASE_URL to core/.env.local, then `npm run migrate` (applies both 20260711 migrations)
- [ ] `node scripts/run-migration.mjs scripts/seed-portal-demo.sql` (demo data, optional)
- [ ] Supabase Auth: confirm **public sign-ups DISABLED** (the app never self-registers)
- [ ] Supabase Auth URL config: allow the /auth/callback redirect (magic links)
- [ ] Vercel → ridgeline-core → Settings → Environment Variables: add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (same value as core/.env.local)
- [ ] Visual pass: /portal owner preview (light + dark), requests round-trip, magic-link send

## After merge

Verify prod deploy reflects master HEAD (merged ≠ shipped), then update STATUS 'In review' → 'Shipped'.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

## After the deploy is verified

- [ ] Supabase → RidgelineKnows → Settings → API Keys → disable the LEGACY anon/service_role keys (only after prod runs on the publishable key — disabling earlier breaks the live site)
- [ ] Remove the legacy fallback in lib/supabase/keys.ts (follow-up commit)


## Known nit (post-merge, cheap fix)

- Portal nav overflows below ~900px viewport width — the theme toggle and sign-out fall off-screen. Needs a wrap or collapse, not urgent for a demo surface.

---

## #1 — fix(app): surface Supabase query errors instead of silently rendering empty
merged 2026-07-03 · `356807b`

## Why

Every server component and action was discarding the Supabase `error` object (`const { data } = await supabase...` → `data ?? []`). When the missing-GRANTs incident hit on 2026-07-03, every query failed with permission-denied but the app showed empty lists — zero indication anything was wrong.

## What

**New (2 files)**
- `lib/supabase/errors.ts` — `queryFailed(table, error)`: `console.error`s every non-null error with its table name (visible in dev-server/deploy logs); returns whether the query genuinely failed. `PGRST116` (zero rows from `.single()`) is logged but returns false so bad IDs still 404 via `notFound()`.
- `components/ui/ErrorState.tsx` + `.error-state` / `.section-card__error` CSS — visible inline error, styled after `EmptyState` in the existing danger palette.

**Pages (28)** — every table query now destructures `error` and reports it:
- List pages render `ErrorState` in place of the table.
- Detail pages return `ErrorState` when the primary fetch fails; missing rows still `notFound()`.
- Related-list sections (contacts, milestones, deliverables, documents) show an inline "failed to load" line.
- Overview and billing stats render `—` instead of a false `0`/`$0` when their query failed.
- Cleanup (permanent-delete queue) refuses to render a partial list if any table failed.
- Form-dropdown option queries log only.
- Also fixed a latent crash: `projects/[id]` called `.filter()` on `milestones` without a null guard.

**Actions (10 files)** — fire-and-forget mutations (`archive`, `advance stage`, `toggle milestone`, `permanent delete`, …) now capture and log errors; form actions log before returning the error to the form as before.

Auth calls (`getUser`, `signOut`, `signInWithPassword`) untouched — out of scope.

## Verification

- `next build` passes clean (compile + types + lint) — all 33 routes.
- Prod server boots; `/login` 200, gated routes 307 → `/login`.
- The failure path itself (e.g. revoked GRANTs) wasn't exercised against the live DB; the logic is the same two-line pattern at every site.

