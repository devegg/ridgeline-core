# Claude Design brief — SpinRoom platform showcase (multi-page)

> **Supersedes `spinroom-one-pager.md`** (owner redirected 2026-07-03).
> SpinRoom is not a one-page product. The live room is the entrance to a
> full platform uncovered one step at a time. The site shows the whole
> platform and explains the theory behind it. The storyline is the point.

Build a multi-page public website for SpinRoom. Everything you need is in
this brief. Do not add facts, numbers, or claims that are not written here.

## The project

SpinRoom is a platform for AI-music creators, live in alpha at
`alpha.spinroom.app`. The public face is a live listening session: a web DJ
booth, a Discord bot, and a real-time audience view working as one system.
Artists drop a Suno link in Discord; the bot builds the queue; the session
plays for a live room; every play persists as a scored, permanent record.

Behind that door is the rest of the platform: a shareable artifact for every
song that plays (SoundCard), a public leaderboard with seasons (SoundStage),
a permanent creator page built from the record (Creator Station), and a
catalog of creative tools and commerce — 24 numbered features in three
layers, some live in alpha, some partly built, some finished designs being
built in the open. The site shows all of it and says which is which.

The recognition layer is free — no plan, no trial, no expiry. Built and
operated by one person. In alpha. The site says so.

## The storyline — read this before designing anything

This section outranks every screen. The narrative arc is the product's core
design decision, and the site's job is to make it visible.

**SpinRoom is a Music City**, built by and for the people who make music
inside it. Most arrive because they heard music coming from the corner bar.
Some never leave. Every artist who passes through leaves a permanent record.

**The city is uncovered one step at a time.** The first five features are a
deliberate sequence, and their order is load-bearing:

1. **SpinRoom** (the live room) — outside the gate. You hear it before you
   decide whether to go inside. A song can play with no account, but it
   plays as "a sound without a face." That gap is the invitation.
2. **Welcome Center** — stepping inside. An account, one song record, the
   moment the city puts your name on the door.
3. **SoundCard** — the artifact. The receipt for a song having played in
   front of real people.
4. **SoundStage** — the courtyard. Records become a public standing, with
   seasons and five ways to win.
5. **Creator Station** — an address in the city. Every remaining door opens
   from here.

The shape of the journey: **hear it → register → earn the artifact →
compete for the standing → have an address in the city.** The ladder, in
the owner's framing: visitor → listener → face → name → career.

**No step is forced.** Each door reveals the next one naturally. Features
06–24 are not a sequence — they are a catalog of buildings in the deeper
city: Catalog & Tools (subscription) and Commerce (subscription, opt-in).

**Design consequence:** the site enacts the reveal instead of describing
it. Pages are ordered like the walk into the city, and each page ends with
one door — a single link to the next page — so a visitor who keeps clicking
"next" gets the same staged uncovering a creator does. Do not flatten this
into a feature grid on one page. The arc is the point.

## Audience

- DJs tired of running live sessions from a notes file and thirty tabs.
- Artists and listeners who want to find a live session and walk in. Both
  mostly arrive from a Discord message on a phone.
- Prospective clients evaluating the thinking. The story page speaks to
  them without turning into a pitch deck.

## Brand

- A live room, not a SaaS pitch. Warm, calm, operator-grade, stage-lit dark.
- Real brand tokens: base `#141312`, surface `#272523`, raised `#332f2c`;
  gold accent `#c9a84c` (the only warm accent; muted/glow opacities for
  borders and spotlight); text `#f1f5f9` / `#b8c4d0` / `#7a8a9a`.
- Type: Inter (system-ui fallback). Generous space. Card radius ~22px.
- Confident but honest. Cover-art-shaped imagery welcome; fake screenshots
  with fabricated data are not.

## Page map — seven pages, ordered like the walk

All 24 features appear exactly once below. Status labels are mandatory
wherever a feature is shown: **Live in alpha**, **Partly built**, **Designed**.

### 1. Home — the gate

- Purpose: get a listener into a live session; hint at the city behind the
  door. Short page. Showcases: 01 SpinRoom, surface level (Live in alpha).
- Headline options:
  - A: "The music is live. The room is real. The record is permanent."
  - B: "You hear it before you decide whether to go inside."
  - C: "Drop a Suno link. Hear it live. Keep the score."
- Subline: "SpinRoom runs live listening sessions for Discord AI-music
  communities — booth, bot, and audience view, one system. Free, in alpha."
- Primary button: "Find a live session". Secondary: "Apply to DJ".
- Door: "Behind this door is a city. → Step into the live room."

### 2. The live room — sessions, booth, bot

- Showcases: 01 SpinRoom in depth (Live in alpha), 23 Synced Lyrics (Partly
  built), today's simple DJ-controlled voting.
- Sections and copy pulls:
  - The DJ: "The DJ's job is to be present. SpinRoom handles the rest."
    Private full-screen booth; setup in under a minute; playback automatic.
  - The artist: "Every submission is a moment. Every moment leaves a
    record." Drop a Suno link; the bot pulls title, artist, and cover art,
    queues it, confirms with a checkmark, and opens a thread for an
    inspiration note and lyrics.
  - The audience: public page, no login. Large Now Playing card, visible
    queue and history. Blind Mode hides names and titles so "the response
    reflects the music alone." Synced lyrics (Partly built): "Lyrics that
    follow the song" — per-line timing that scrolls with playback.
  - The archive: automatic — order, art, attribution, engagement. "The
    session existed. The record proves it."
- Door: "The room heard the music. The city didn't know who made it. →
  What a play leaves behind."

### 3. The record — Welcome Center and SoundCard

- Showcases: 02 Welcome Center (Partly built), 03 SoundCard (Live in alpha).
- Copy pulls:
  - "The Welcome Center is the moment the city puts your name on the door."
    One account, one song record — title, story, lyrics, an MP3. Less than
    a minute. From then on, name, message, and lyrics travel with every
    submission.
  - "The SoundCard is not a profile feature. It is a receipt." Issued
    automatically the first time a song plays; updates after every session.
    Hero stat is Heard By — a people count, not a play count. Permanent
    public song page; embeddable card formats. "The card is what travels."
  - Closer: "In a world where most music disappears the moment it finishes
    playing, the SoundCard makes sure something stays."
- Door: "One card is proof. Many cards are a standing. → The board."

### 4. The board — SoundStage and Creator Station

- Showcases: 04 SoundStage (Live in alpha), 05 Creator Station (Partly built).
- Copy pulls:
  - "Most platforms ask creators to perform into silence. There is no
    scoreboard. No season. No moment when the community says: this one."
  - Five ways to win: Most Attended, Highest Voted, Most Consistent, Best
    New Artist, Rising Artist. Quarterly seasons reset the board. Standings
    are public.
  - Creator Station: "It is not a profile page. The work speaks, and the
    platform builds the case." Assembled from the record — every session,
    every room, every score. Free from the first song.
    Closer: "Every room you filled is a fact. We keep the facts."
- Door: "A board this real can host a real contest. → Contest night."

### 5. Contest night — voting and contests

- Showcases: 24 Voting and Contests (Designed). Shown as design, never as
  shipped product — label the whole page.
- Copy pulls:
  - "Voting that fits the chat. Contests that fit the night."
  - The DJ picks a 1-to-N scale before going live. Votes are Discord
    buttons on the bot's now-playing post — no chat spam, last click wins.
    Any reaction on the same post counts as a like.
  - Contest Mode is a checkbox: a public contest page with title and rules;
    every song played is an entry; scores hidden until the close; a results
    splash; a personal DM to every creator who competed — score and
    standing. Closer: "Voting becomes a knob. Contests become a mode. The
    night becomes whatever the DJ wants it to be."
- Door: "Past the courtyard, the city keeps going. → The deeper city."

### 6. The deeper city — tools, commerce, operations

- Purpose: the catalog layers as districts on a map — one card per
  building: a name, one or two sentences, a status label. No fake depth.
- Tools district: 06 Lyric Studio (Designed — "A lyric is not a prompt";
  AI-assisted writing where every step logs as provenance), 07 Song Catalog
  (Partly built — "the permanent home of a creator's body of work"),
  08 Trust Office (Partly built — the contemporaneous record of how a track
  was made, answering "Who made this?"), 09 Data Portability ("Export
  everything. The creator owns their catalog"), 10 Genre System,
  12 Playlists, 13 Playlist Categories, 14 AI Tagging (all Designed).
- Commerce district (all Designed): 18 Global Marketplace ("A Creator
  Storefront belongs to a creator. The Marketplace belongs to them all"),
  19 Creator Storefront (sell music, art, prompts, lyrics, feedback — owned
  and priced by the creator), 20 Custom Domains, 15 Affiliate Program,
  16 Organizational Partners, 17 Promotional Codes.
- Utilities strip: 11 Credit System (Designed — AI actions cost credits,
  price shown before you confirm), 21 Cost Tracking (Partly built —
  operator dashboard of real AI spend), 22 Affiliate Tracking (Designed).
- Door: "Why build a city this way? → The story."

### 7. The story — the theory page

- Purpose: the portfolio centerpiece — the builder explaining the design in
  first person ("I"). Longest page, mostly text, carefully typeset.
- Content, in order:
  - The problem: AI-music creators have no home, and most of what they make
    disappears the moment it finishes playing — no artifact, no record.
  - The idea: build a city, not an app. The Music City framing from the
    Storyline section, told plainly.
  - The reveal principle: why 01–05 are a fixed sequence and 06–24 a
    catalog. Each free step creates the pull toward the next; by the time
    anything costs money, the creator already lives in the city.
  - The record as the spine: card, board, and station are all assembled
    from the same session record. The community generates the record; the
    platform keeps it honest.
  - Building in the open: all 24 features, one line each, grouped by
    layer, with today's real status.
- Ends with the only pitch on the site, three sentences at most: I design
  and build systems like this. SpinRoom is the proof, in public, in alpha.
  Footer credit on every page: "Built and operated by Brian Boyd."

## Honest status — non-negotiable

- The platform is in alpha. Say "alpha" wherever status comes up.
- Status labels, from the actual build: **Live in alpha:** 01, 03, 04.
  **Partly built:** 02, 05, 07, 08, 21, 23. **Designed:** 06, 09–20, 22, 24.
- Never present a Designed feature in shipped-product voice. Mockups of
  designed features are fine when labeled as design.
- No usage numbers, user counts, or growth claims. If a sentence needs a
  number this brief does not contain, cut the number, keep the sentence.
  No testimonials, real or implied. None exist yet.

## Copy rules — do

- Plain English. Short sentences. Sentence case throughout.
- Product pages speak to a DJ or an artist ("you"). The story page speaks
  as the builder ("I"). Nothing speaks to an investor.
- Use only facts and copy in this brief. The quoted lines are real platform
  copy — reuse them verbatim where they fit.
- Keep names as written: SpinRoom, Welcome Center, SoundCard, SoundStage,
  Creator Station, Lyric Studio, Trust Office.

## Copy rules — don't

- Banned words: leverage, seamless, game-changer, unlock, empower, robust,
  synergy, deep dive.
- No lorem ipsum. No fake screenshots with made-up data, no fabricated
  leaderboard names. Every string is real copy from this brief.
- No song lyrics anywhere, even as decoration, even in the synced-lyrics
  section — use a neutral placeholder shape instead.
- No history lesson: the platform's name is SpinRoom, full stop. No prior
  project names, no partnership backstory.

## Technical requirements

- Seven pages, shared header and footer. Nav may be a compact menu; the
  primary navigation is the door link ending each page.
- Mobile-first. It must read well at 375px before it is styled for desktop.
- Fast. Dark theme per the brand tokens. No heavy frameworks — a content
  site with careful typography, not an app.
