create table public.card_library (
  id uuid primary key default gen_random_uuid(),
  card_code text not null unique,
  card_name text not null,
  suit text not null check (suit in ('hearts', 'diamonds', 'clubs', 'spades', 'joker')),
  value text not null,
  core_theme text,
  keywords text[],
  shadow_keywords text[],
  locked_in_summary text,
  checked_out_summary text,
  created_at timestamptz default now()
);

alter table public.card_library enable row level security;

create policy "Authenticated users can read card library"
  on public.card_library
  for select
  to authenticated
  using (true);
