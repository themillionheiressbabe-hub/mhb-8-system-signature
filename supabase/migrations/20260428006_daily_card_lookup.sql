create table public.daily_card_lookup (
  id uuid primary key default gen_random_uuid(),
  month integer not null check (month between 1 and 12),
  day integer not null check (day between 1 and 31),
  card_code text not null references public.card_library(card_code),
  planetary_ruling_card_code text references public.card_library(card_code),
  created_at timestamptz default now(),
  unique (month, day)
);

alter table public.daily_card_lookup enable row level security;

create policy "Authenticated users can read daily card lookup"
  on public.daily_card_lookup
  for select
  to authenticated
  using (true);
