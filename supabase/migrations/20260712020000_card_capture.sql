-- Business-card capture (owner request 2026-07-12): snap a card in the field,
-- OCR it locally (tesseract.js, $0), confirm the extracted fields, and the
-- photo + contact details land on a prospect. Owner-only, like the rest of
-- the field kit (D19).

alter table prospects
  add column if not exists contact_name text,
  add column if not exists email text,
  add column if not exists card_photo_path text;

-- Private bucket for card photos. Owner role only — clients have no path in.
insert into storage.buckets (id, name, public)
values ('cards', 'cards', false)
on conflict (id) do nothing;

create policy cards_owner_all on storage.objects for all
  using (bucket_id = 'cards' and auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (bucket_id = 'cards' and auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');
