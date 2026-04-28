create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  product_slug text not null,
  product_name text not null,
  amount_pence integer not null,
  currency text default 'gbp',
  stripe_payment_intent_id text,
  stripe_session_id text,
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  engine integer check (engine between 1 and 7),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders
  for select
  using (auth.uid() = profile_id);
