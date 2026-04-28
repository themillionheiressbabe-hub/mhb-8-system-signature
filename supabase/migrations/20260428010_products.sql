create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  engine integer check (engine between 1 and 7),
  price_pence integer not null,
  currency text default 'gbp',
  description text,
  is_active boolean default true,
  is_free boolean default false,
  requires_time_of_birth boolean default false,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Authenticated users can read active products"
  on public.products
  for select
  to authenticated
  using (is_active = true);
