> **2026-07-11:** provisioning is automated — Clients → [client] → Portal data →
> Portal login (create + change email, dual notification). This runbook remains
> the manual fallback and the reference for what the automation does.

# Client Portal — Provisioning Runbook

Turning a client contact into a portal login. ~5 minutes, done rarely.
(Automation candidate later; procedure first — per the workspace playbook.)

## 1. The records (in the Ridgeline dashboard)
1. Client exists under **Clients** (create if not).
2. Contact exists under the client with **Portal user** flag on.
3. Copy the **client id** from the client detail page URL (`/clients/<uuid>`).

## 2. The auth user (Supabase dashboard)
Authentication → Users → **Add user → Create new user**
- Email: the contact's email
- Password: have the client set it via "Send password recovery" after creation,
  or set a temporary one and require them to change it in Settings.
- Check **Auto Confirm User**.
Copy the new **user id**.

## 3. The role stamp (SQL editor — the one hand-run exception)
Roles live in `app_metadata` (users cannot edit it themselves). Run:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data ||
  '{"role": "client", "client_id": "<CLIENT-UUID-FROM-STEP-1>"}'::jsonb
WHERE id = '<USER-UUID-FROM-STEP-2>';
```

## 4. Verify (2 minutes, every time)
1. Log in as the client (private browser window) → lands on `/portal`.
2. They see ONLY their projects/assessments/invoices; `/overview` redirects
   them back to the portal (middleware + RLS both enforce this).
3. Deliverables show only when status = `delivered`; documents only when
   shared; invoices only when non-draft.

## Revoking access
Supabase dashboard → Authentication → Users → delete (or ban) the user.
Data is untouched — access simply ends.
