---
name: ridgeline-core-doc-sync
description: >
  Reconciliation discipline that keeps ridgeline-core's documentation in sync
  with the code so nothing falls through the cracks: stale claims, unstruck
  open items, work that shipped with no doc entry, decisions nobody recorded,
  and doc claims that overstate what is actually built. Use at the start and
  end of any build session, after merging a PR or applying a migration, before
  marking anything done or shipped, and any time the user asks what is stale,
  what changed, or whether the docs are current.
---

# ridgeline-core Doc Sync

**Last Updated:** 2026-07-11 (born with the ops retrofit, D11)

## The cardinal rule

**Code is ground truth for what is built.** When a doc and the code disagree,
the code wins and the doc is stale: fix the doc. Never edit a doc to describe
anything as more finished, more automated, or more intelligent than the code
actually is.

## The authority model

- `docs/STATUS.md` — the **status authority**. If any doc disagrees with it on
  status, align that doc (after confirming STATUS itself matches the code).
- `docs/decisions-log.md` — the **decisions authority**. Locked D#s override
  contrary prose anywhere; open items live in its register.
- Workspace-level rules and ADRs live one level up (`../CLAUDE.md`,
  `../docs/decisions/`).

## Before you name or number anything, look it up first

D#s and migration filenames are permanent and never reused. The next D# comes
from the **committed** `docs/decisions-log.md` (`git show HEAD:docs/decisions-log.md`),
never from memory or the working tree. The next migration name is one past the
newest file in `supabase/migrations/` on disk.

## The reconciliation pass

Run at session end, after any PR or migration, and before declaring anything
done:

1. **Code → STATUS.** Every surface/behavior that shipped since the last pass
   has a STATUS entry; every new migration is reflected wherever schema is
   described. Keep STATUS durable: shipped state and standing rules, not
   sprint play-by-play.
2. **Claim accuracy (the judgment step).** For anything described as computed,
   automated, or intelligent — open the code and confirm it actually does
   that. Demote anything mock-not-real or manual-not-automated. (The portal's
   value numbers must always trace to `lib/portal/value.ts` + real rows.)
3. **Decisions.** Any decision made this session (naming, pricing, security
   posture, a "we'll defer X") gets a new D# with what it overrides.
4. **Open items.** Strike resolved register items the moment they resolve; add
   the ones the new work created.
5. **Headers.** Bump `Last Updated:` on every doc touched; check each doc's
   header still matches its own body.
6. **Cross-doc contradictions.** When two docs disagree, the authority wins
   and the other is aligned.
7. **Inbox.** `ls docs/__inbox/` — every landed task file moved (individually)
   to `completed/`; nothing pending in the root that this session finished.
8. **Lessons routing.** What did this session teach? Route each lesson to
   exactly ONE home — a rail in CLAUDE.md, `docs/decisions-log.md`, Claude
   memory, or (if it generalizes beyond this project) an upstream proposal for
   the Genesis Kit at `/Users/brianboyd/_0` — flagged to the owner,
   propose-then-approve; never edit the Kit directly. If the lesson already
   lives somewhere, point at it — duplicates are refused.

## Drift patterns to hunt

- STATUS carrying "in review" for merged work (or vice versa).
- A migration on disk that no doc mentions.
- Marketing copy promising what the code doesn't do yet ("ahead of the code" —
  align, never harsh language).
- An open-items row that quietly resolved.
- A decision made in chat but never logged.
