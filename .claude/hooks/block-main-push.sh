#!/usr/bin/env bash
# block-main-push.sh — PreToolUse(Bash) gate enforcing the branch + PR policy.
#
# Ported from ridgeline-workspace 2026-08-22 (the PORT-push-guard proposal, item 4).
# core had warn-main-commit.mjs, which gates COMMITS to the default branch; nothing
# gated the PUSH. Handles main and master both, so it works here unmodified.
#
# Denies any `git push` whose destination is the default branch (main/master, or
# whatever origin/HEAD points at). Docs state the rule; this makes it true.
#   Policy: docs/PLAYBOOK.md "Git workflow" + global memory git-pr-default-policy.
#
# The documented exceptions still exist, but must now be taken deliberately and
# they show up in the transcript:
#   ALLOW_MAIN_PUSH=1 git push origin main
#
# Always exits 0; a denial is expressed as JSON on stdout.

set -uo pipefail
set -o noglob   # tokens are split by word, never glob-expanded

payload="$(cat 2>/dev/null || true)"
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
[ -n "$cmd" ] || exit 0

deny() {
  jq -nc --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

# `git`, optional global flags, then the `push` subcommand.
GIT_PUSH_RE='(^|[;&|[:space:]])git([[:space:]]+(-C[[:space:]]+[^[:space:]]+|-c[[:space:]]+[^[:space:]]+|--git-dir=[^[:space:]]+|--work-tree=[^[:space:]]+))*[[:space:]]+push([[:space:]]|$)'

# Flags that consume the following token, so it is not mistaken for a refspec.
takes_value() {
  case "$1" in
    -o|--push-option|--repo|--exec|--receive-pack|--signed) return 0 ;;
    *) return 1 ;;
  esac
}

is_protected() {
  local b="$1" d="$2" def
  [ -n "$b" ] || return 1
  case "$b" in main|master) return 0 ;; esac
  def="$(git -C "$d" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
  def="${def#origin/}"
  [ -n "$def" ] && [ "$b" = "$def" ]
}

workdir="$PWD"

# Split compound commands so `cd repo && git push` is seen as two steps.
segments="$(printf '%s\n' "$cmd" | sed -E 's/(\&\&|\|\||;)/\n/g')"

while IFS= read -r seg; do
  seg="${seg#"${seg%%[![:space:]]*}"}"
  seg="${seg%"${seg##*[![:space:]]}"}"
  [ -n "$seg" ] || continue

  # Track `cd` so the current-branch lookup happens in the right repo.
  if [[ "$seg" =~ ^cd[[:space:]]+([^[:space:]]+) ]]; then
    t="${BASH_REMATCH[1]}"
    t="${t%\"}"; t="${t#\"}"; t="${t%\'}"; t="${t#\'}"
    case "$t" in
      /*) workdir="$t" ;;
      "~"*) workdir="${t/#\~/$HOME}" ;;
      *) workdir="$workdir/$t" ;;
    esac
    continue
  fi

  # Deliberate, visible escape hatch for the documented emergency case.
  case "$seg" in *ALLOW_MAIN_PUSH=1*) continue ;; esac

  [[ "$seg" =~ $GIT_PUSH_RE ]] || continue

  segdir="$workdir"
  if [[ "$seg" =~ git[[:space:]]+-C[[:space:]]+([^[:space:]]+) ]]; then
    p="${BASH_REMATCH[1]}"
    case "$p" in /*) segdir="$p" ;; *) segdir="$workdir/$p" ;; esac
  fi

  args="$(printf '%s' "$seg" | sed -E 's/.*[[:space:]]push([[:space:]]|$)/ /')"

  positional=()
  skip=0
  for tok in $args; do
    if [ "$skip" = 1 ]; then skip=0; continue; fi
    case "$tok" in
      -*) takes_value "$tok" && skip=1 ;;
      *) positional+=("$tok") ;;
    esac
  done

  hit=""
  if [ "${#positional[@]}" -le 1 ]; then
    # No refspec: the push follows the current branch.
    br="$(git -C "$segdir" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    is_protected "$br" "$segdir" && hit="$br"
  else
    for ((i = 1; i < ${#positional[@]}; i++)); do
      spec="${positional[$i]}"
      spec="${spec#+}"
      dst="${spec##*:}"
      if [ "$dst" = "HEAD" ]; then
        dst="$(git -C "$segdir" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
      fi
      dst="${dst#refs/heads/}"
      if is_protected "$dst" "$segdir"; then hit="$dst"; break; fi
    done
  fi

  [ -n "$hit" ] && deny "Blocked: this would push directly to '$hit'.

Policy is branch per task -> PR to master, never a direct push
(CLAUDE.md 'Conventions'; workspace docs/PLAYBOOK.md 'Git workflow').

Do this instead:
  git switch -c <branch>
  git push -u origin <branch>
  gh pr create

Emergency or Brian-said-so this turn (say which, and why):
  ALLOW_MAIN_PUSH=1 <your push command>"

done <<< "$segments"

exit 0
