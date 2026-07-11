-- Owner-managed industry list (single-select with inline add on forms).
create table industries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz default now() not null
);
alter table industries enable row level security;
create policy "owner_all" on industries for all to authenticated
  using      (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'owner');
grant all on industries to authenticated, service_role;

-- Seed: the target list (coastal-SC research verticals + current client mix).
insert into industries (name) values
  ('Vacation rental management'),
  ('Property management'),
  ('Real estate'),
  ('Construction & trades'),
  ('HVAC & home services'),
  ('Medical & dental'),
  ('Hospitality & restaurants'),
  ('Marine & boating'),
  ('Retail'),
  ('Manufacturing'),
  ('Accounting & bookkeeping'),
  ('Professional services')
on conflict (name) do nothing;
