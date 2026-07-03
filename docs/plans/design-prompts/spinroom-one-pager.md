# Claude Design brief — Spinroom one-pager

Build a single-page public website for Spinroom. Everything you need is in this
brief. Do not add facts, numbers, or claims that are not written here.

## The project

Spinroom is a free live listening-session platform for Discord AI-music
communities. It connects three surfaces into one coordinated system: a web DJ
booth, a Discord bot, and a real-time audience view. Artists submit tracks by
pasting a Suno link into a Discord channel; the bot builds the queue and
enforces the submission rules. Every session persists as a scored archive. A
public schedule lists every live and upcoming session, and anyone can walk into
a live session with no account. The platform is free, with no paid tier. It is
currently in alpha.

## Audience

Discord AI-music communities. Two readers:

- DJs who host live listening sessions and are tired of running them from a
  notes file, a Suno playlist, and a Discord window they cannot look away from.
- Listeners and artists who want to find a live session and walk in.

They already live in Discord. The page's job is to show them the room exists.

## Brand personality

- A live room, not a SaaS pitch. Warm, calm, operator-grade. The product does
  the work quietly so the DJ can host.
- Dark and stage-lit: near-black base `#141312` with gold accent `#c9a84c`.
  System font stack. Generous space. Cover-art-shaped imagery is welcome;
  fake screenshots with fabricated data are not.
- Confident but honest. This is an alpha and the page says so plainly.

## Page structure (single page, in this order)

### 1. Hero

Pick one headline (or offer variants of these — same meaning, same plainness):

- Option A: "Live listening sessions, without the notepad."
- Option B: "The queue builds itself. You host the room."
- Option C: "Drop a Suno link. Hear it live. Keep the score."

Subline: "Spinroom runs live listening sessions for Discord AI-music
communities — a web DJ booth, a Discord bot, and a live audience view working
as one system. Free, no paid tier."

Primary button: "Find a live session". Secondary link: "Apply to DJ".

### 2. How it works (3 steps)

1. **Drop a link.** Artists paste a Suno link into the session's Discord
   channel. The bot adds it to the queue, confirms with a checkmark, and opens
   a thread for a description, an inspiration note, and lyrics to display
   during playback.
2. **Run the room.** The DJ hosts from one screen: queue, playback, voting,
   and display. The bot enforces the rules — one track per artist — so the DJ
   is not policing the chat.
3. **Walk right in.** Listeners open the public schedule, pick a live session,
   and they are in the audience view. No account needed.

### 3. Every session leaves a record

When the voice channel closes, the session does not vanish into chat history.
The queue, the votes, the descriptions, and the lyrics all persist as a scored
archive the artist and the community can return to. Every artist who submits a
track gets a provisional account with their songs already cataloged — theirs
to claim.

### 4. One public entry point

The schedule shows every active and upcoming session across all DJs, organized
by day of the week, with live sessions on top. Click a live session and you are
in. This is the first time the scene has had a single public place to find the
format.

### 5. Closing CTA

Short. Restate: free, built for Discord AI-music communities, in alpha.
Primary button: "Find a live session". Secondary: "Apply to DJ".
Footer credit: "Built and operated by Brian Boyd."

## Copy rules — do

- Plain English. Short sentences. Sentence case throughout.
- Speak to a DJ or a listener, not an investor.
- Use only the facts in this brief. If a section needs a number this brief
  does not contain, cut the number, keep the sentence.
- Say "alpha" honestly wherever status comes up.

## Copy rules — don't

- Banned words: leverage, seamless, game-changer, unlock, empower, robust,
  synergy, deep dive.
- No lorem ipsum anywhere. Every string on the page is real copy.
- No invented stats, user counts, session counts, or growth claims.
- No testimonials, real or implied. None exist yet.
- No song lyrics anywhere on the page, even as decoration.
- No fake product screenshots with made-up data.

## Technical requirements

- Single page. No multi-page navigation; anchor links only if needed.
- Mobile-first. Most of this audience will open it from a Discord message on
  a phone. It must read well at 375px before it is styled for desktop.
- Fast and self-contained. No heavy frameworks needed for a one-pager.
