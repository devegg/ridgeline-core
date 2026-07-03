# Design Brief — RidgelineKnows.com Splash Page

Save to: `docs/plans/` (tracked). Paste the prompt below into Claude Design.
Purpose: a temporary branded holding page the domain points to while the full
site is polished. Replaces the Squarespace "Coming Soon" parking page.

---

## The prompt

Design a single splash page for **Ridgeline Knows** (ridgelineknows.com) — a
one-person operations-and-automation consultancy in Myrtle Beach, South
Carolina, run by Brian Boyd, thirty years inside real business operations. The
full site is being finished; this page holds the domain until then. It should
feel like a craftsman's business card left on a door: quiet, confident,
finished — not a placeholder apologizing for itself.

### Concept: first light over the ridgeline

The single visual idea is a mountain ridgeline at dawn. One idea, executed
perfectly. No other imagery.

**Motion narrative (the whole intro under ~3 seconds):**
1. The page opens near-dark: a deep slate night sky, empty.
2. A thin line draws itself left to right, tracing a ridgeline silhouette
   across the lower third (SVG stroke animation — one continuous line, like a
   pen stroke, slightly irregular, hand-surveyed).
3. As the line completes, dawn rises behind it: a warm gradient lifts from
   the horizon, the sky eases from deep slate toward soft warm gray. Slow,
   like light actually arriving — no flash.
4. The wordmark **RIDGELINE KNOWS** fades in above the ridge, then the
   supporting lines, staggered gently.
5. Settled state: everything at rest except one barely-perceptible motion —
   a slow breathing of the dawn gradient. Nothing loops visibly. Nothing
   bounces. The page becomes a still object you could frame.
6. `prefers-reduced-motion`: skip straight to the settled state.

### Copy (use exactly this — do not rewrite it)

- Wordmark: **RIDGELINE KNOWS**
- Line 1: *I help businesses eliminate hours lost to tasks that can run automatically.*
- Line 2: *The full site is on its way. The work isn't waiting.*
- Contact: **Let's talk → brian@ridgelineknows.com** (mailto link)
- Footer, small: *Myrtle Beach, South Carolina*

### Typography & palette

- Serif display for the wordmark and Line 1: **Newsreader** (matches the
  full site coming behind this page). Supporting text: **IBM Plex Sans**.
- Palette direction (freedom within it): night slate `#1B2430`-ish → dawn
  warmth `#E3A87C`-ish at the horizon → settled warm paper tones for text
  surfaces. High contrast on all text (AA minimum). No purple-gradient
  SaaS look.

### What this page must never have

Countdown timers. Progress bars. Spinners. Particle effects. Typing-cursor
gimmicks. Stock photography. Email-capture forms. Social icons. The words
"unlock, leverage, seamless, game-changer, empower, robust, synergy."
Anything that says "template."

### Deliverable & constraints

- One self-contained HTML file: inline CSS and JS, no frameworks, no external
  dependencies beyond the two fonts. Target under ~100KB total.
- Fully responsive, 320px through ultrawide; the ridgeline composition must
  hold at every size (the line may simplify on small screens, never crop
  awkwardly).
- Semantic HTML, visible focus states, honored `prefers-reduced-motion`.
- `<title>`: `Ridgeline Knows — Operations & Automation, Myrtle Beach SC`;
  meta description: `I help businesses eliminate hours lost to tasks that can
  run automatically. Full site coming soon.`; Open Graph title/description to
  match (OG image optional — the settled page itself is the aesthetic).

---

## Deploy note (not part of the design prompt)

When the design is done: deploy as its own tiny Vercel project (e.g.
`ridgelineknows-splash`), point the Squarespace DNS records at it, and the
domain shows this instead of the parking page. Later, Phase 5's cutover
re-points the same records at core — the splash project then retires.
