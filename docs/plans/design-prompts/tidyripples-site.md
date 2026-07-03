# Claude Design brief — TidyRipples website refresh

Redesign the TidyRipples website. Everything you need is in this brief — do not invent facts, copy, numbers, or clients beyond what is written here.

## The business in one line

TidyRipples is my professional organizing and systems business: physical spaces and digital systems treated as one problem, organized so order lasts.

## Audience

Homeowners and small offices on the Grand Strand / Myrtle Beach area. Busy people. They skim. They want to know what I do, how it works, and how to reach me — without wading through fluff.

## Brand personality

Warm and calm. The visual motif is ripples: a single stone dropped into still water, rings expanding outward. Use the motif quietly — in section dividers, iconography, or subtle background texture — not as loud decoration. The site itself should feel like an organized room: generous whitespace, clear hierarchy, nothing crowded.

## Current site: keep and fix

The current site is an Eleventy (11ty) static build with Nunjucks templates, SCSS, JSON data files, hosted on Netlify. An audit found these things work and should carry over:

- The ripple-effect storytelling. It is the strongest thing on the site.
- Consistent service-page structure: challenge, then solution, then process.
- Clear calls to action throughout.
- Component-based structure and responsive layout with a working mobile menu.

Known gaps to fix in the redesign:

- Add canonical link tags on every page.
- Add JSON-LD structured data: LocalBusiness plus each service.
- Add Open Graph and Twitter card meta tags.
- Lazy-load images; use responsive images (srcset); set font-display: swap.
- Add breadcrumbs on service pages, a skip-to-content link, ARIA attributes on interactive elements, and check color contrast.
- Contact form needs client-side validation with helpful error messages and a visible success state.
- Add a custom 404 page and a complete favicon package.

## Required sections and copy

Use the copy below. You may tighten sentences, but keep the facts and phrasing intact.

### 1. Hero

Headline — pick one of these three:

1. "Get organized once. Feel it everywhere."
2. "One organized space starts the ripple."
3. "Organization is not the deliverable. What follows is."

Subline: "Professional organizing for homes, offices, and the digital mess behind them — built so order lasts, not so you have to call me back."

CTA button: "Book a free consultation"

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

Personal section, first person, warm. Copy:

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

### 6. Contact

Simple form: name, email, message. Validation with helpful errors and a clear success state. Repeat the "Book a free consultation" CTA. State the service area: the Grand Strand / Myrtle Beach area.

## Do / Don't

Do:

- Plain English. Short sentences. The reader is a busy owner.
- First person singular throughout — "I" is Brian Boyd, the founder.
- Mobile-first. Design at phone width first, then scale up.
- Use only the copy and facts in this brief.

Don't:

- Never use these words: leverage, seamless, game-changer, unlock, empower, robust, synergy, deep dive.
- No lorem ipsum anywhere. Every string on the page must be real copy.
- No fake testimonials and no made-up client counts or results. The current site has testimonial sections — omit them entirely unless I supply real quotes.
- No hype, no stock-photo clutter, no crowded layouts.
