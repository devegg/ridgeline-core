/**
 * Keep password managers out of the field forms.
 *
 * Nothing on a field screen is a credential — it's a task description, a
 * count, someone else's phone number. But managers heuristically offer to
 * fill (and to SAVE) any bare text input, and a vault popup covering the
 * screen while an owner is watching you work is a demo-killer.
 *
 * `autocomplete="off"` alone is widely ignored, so each major manager gets
 * its own opt-out attribute:
 *   data-1p-ignore    1Password
 *   data-lpignore     LastPass
 *   data-bwignore     Bitwarden
 *   data-form-type    Dashlane ("other" = not a login form)
 *
 * Spread onto every input on a field screen.
 */
export const noAutofill = {
  autoComplete: 'off',
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const
