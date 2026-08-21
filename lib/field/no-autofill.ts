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
 *
 * THESE ATTRIBUTES ARE NOT ENOUGH ON A PHONE. On Android the managers run as
 * autofill *services* through the OS framework, not as browser extensions,
 * and the framework never sees data-lpignore and friends. It classifies a
 * field by the words around it instead.
 *
 * So the second half of the job is copy: keep `email`, `user`, `username`,
 * `login`, `password` and `admin` out of every placeholder and label on a
 * field screen unless the input really is that thing. A placeholder reading
 * "Retyping vendor invoices from email" was enough to make LastPass treat the
 * task-name box as an email field and open the vault over it, mid-visit, with
 * the prospect watching — attributes present and correct the whole time.
 */
export const noAutofill = {
  autoComplete: 'off',
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const
