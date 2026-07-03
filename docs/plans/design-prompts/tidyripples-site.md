# Claude Design brief — TidyRipples demonstration site

Revised 2026-07-03 per owner.

Design the TidyRipples website from scratch. Everything you need is in this brief — do not invent facts, copy, numbers, or clients beyond what is written here.

## What this is (read first)

TidyRipples was never an operating business and never had a live website. I registered the domain, designed the whole business — brand, philosophy, service model, engagement process — and then decided it was not the business I wanted to run. This site is a demonstration: a public showcase of that complete business design, presented the way the real site would have looked.

Two consequences:

1. The site reads in-world — as the business site would read — but it must carry an honest disclosure (rules below).
2. The site ends with a small, tasteful note that the domain, the brand, and the complete business design are for sale to the right buyer.

## The business in one line

TidyRipples is a professional organizing and systems business: physical spaces and digital systems treated as one problem, organized so order lasts.

## Audience

Two readers. In-world: busy homeowners and small-office owners who skim and want to know what the service does and how it works. Real-world: a prospective buyer of the business design, judging the thinking. No city or region targeting anywhere in the site copy — the business is location-neutral by design.

## Brand personality

Warm and calm. The visual motif is ripples: a single stone dropped into still water, rings expanding outward. Use the motif quietly — section dividers, iconography, subtle background texture — not loud decoration. The site should feel like an organized room: generous whitespace, clear hierarchy, nothing crowded.

## Honesty rules (non-negotiable)

- Small print in the footer of every page: "This is a demonstration website. TidyRipples is a complete business design, not an operating business."
- Fictional testimonials are allowed — but only with small print directly beside them stating plainly that this is a demonstration website and the testimonials are fictional. No testimonials without that disclosure, ever.
- Fictional testimonials carry no numbers, results claims, or client counts. Plausible voice, first names or initials only.
- No invented statistics anywhere else on the site.

## Required sections and copy

A single long page is fine; split into pages only if the design earns it. Use the copy below. You may tighten sentences, but keep the facts and phrasing intact.

### 1. Hero

Headline — pick one:

1. "Get organized once. Feel it everywhere."
2. "One organized space starts the ripple."
3. "Organization is not the deliverable. What follows is."

Subline: "Professional organizing for homes, offices, and the digital mess behind them — built so order lasts, not so you have to call me back."

CTA button: "See how it works" — scrolls to the five-ripples section.

### 2. The idea — five expanding ripples

Intro copy: "Tidy is the service: order from chaos, whether in a physical space, a digital workflow, or a business operation. Ripples are what happens next. Drop a single stone into still water and it creates expanding rings that transform the entire surface. Organizing one space doesn't stay contained to that space."

Present the five ripples as an ordered sequence, each extending from the one before:

1. Physical space — cleared and made functional.
2. Mental clarity — and reduced stress.
3. Streamlined productivity.
4. Better lifestyle and relationships.
5. Continuous growth — across every area of life.

Pull quote, displayed prominently: "Organization is not the deliverable. The cascade that follows is the deliverable."

### 3. The origin story

Personal section, first person, warm. This is real biography — the family setting stays. Copy:

"As a kid, while other kids earned pocket money mowing lawns, I was organizing garages and storerooms — the places where people tuck away things they no longer want to see. It ran in the family. For nearly 40 years, my mother and aunt operated two successful cleaning businesses on the Grand Strand: Bonnie's Cleaning Service and Capital Cleaning — construction cleaning, plus regular office and condo maintenance. I grew up seeing the difference a well-maintained space makes.

Cleaning was not the calling. Organizing was.

The digital side comes from over thirty years building custom CRM systems, automating business processes, and helping businesses move from spreadsheets to structured databases. TidyRipples brings both together under one roof."

### 4. Services — four categories

- **Physical Space** — home organization, office optimization, storage solutions, moving support, paper management, seasonal organization.
- **Digital Systems** — file organization, email management, password security, cloud storage optimization, digital asset management.
- **Business Support** — office systems development, workflow optimization, document management, team coordination, process organization.
- **Specialized** — life transitions, estate organization, downsizing assistance, remodel preparation, move management.

### 5. How an engagement works — five stages

1. **Free consultation** — we talk through what's actually going on.
2. **Strategic planning** — a plan that fits how you really live or work.
3. **Implementation** — the work gets done.
4. **Education** — I teach you to run the system yourself.
5. **Ongoing support** — there if you want it, never required.

Framing copy: "The education stage is deliberate. You leave with a system you can operate on your own — not a dependency on return visits."

### 6. Testimonials (optional)

If included: two or three short fictional quotes in plausible client voices, styled quietly, with the disclosure small print directly beneath. See Honesty rules.

### 7. End of site — the offer

Small and calm. Not a banner, not a modal, no urgency. Final section before the footer. Copy:

"TidyRipples is a complete business design: the brand, the philosophy, the service model, the engagement process, and this site. I designed it, then chose a different path. The domain, the brand, and the full design are for sale to the right buyer. If that might be you, write to me."

Follow with a simple contact form (name, email, message) or a plain email link — your call on which fits the design. If a form: client-side validation with helpful errors and a visible success state; leave the submit endpoint as a stub I can wire up.

## Implementation

- Fresh design. Do not reference or preserve any earlier version of this site.
- Next.js (App Router), deployed on Vercel — same build approach as my current sites. Static-friendly; no CMS.
- Mobile-first. Design at phone width first, then scale up.
- Standard quality bar: Open Graph and Twitter card meta tags, canonical tags, a custom 404, complete favicon set, lazy-loaded responsive images with srcset, font-display: swap, skip-to-content link, ARIA on interactive elements, passing color contrast.
- No LocalBusiness structured data — there is no operating business and no service area.

## Do / Don't

Do:

- Plain English. Short sentences. First person singular — "I" is Brian Boyd, the designer of the business.
- Use only the copy and facts in this brief.

Don't:

- Never use these words: leverage, seamless, game-changer, unlock, empower, robust, synergy, deep dive.
- No lorem ipsum. Every string on the page must be real copy.
- No city or region targeting in business copy. The Grand Strand appears once, in the origin story, as family history — nowhere else.
- No invented client counts or results. Testimonials only under the Honesty rules.
- No hype, no stock-photo clutter, no crowded layouts.
