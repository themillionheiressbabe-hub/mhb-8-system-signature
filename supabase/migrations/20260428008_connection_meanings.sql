create table public.connection_meanings (
  id uuid primary key default gen_random_uuid(),
  connection_code text not null unique,
  connection_name text not null,
  category text,
  description text,
  locked_in_expression text,
  checked_out_expression text,
  saturn_safety boolean default false,
  created_at timestamptz default now()
);

alter table public.connection_meanings enable row level security;

create policy "Authenticated users can read connection meanings"
  on public.connection_meanings
  for select
  to authenticated
  using (true);
