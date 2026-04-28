create table public.reports (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_slug text not null,
  engine integer,
  status text default 'draft' check (status in ('draft', 'in_review', 'delivered')),
  content jsonb,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users can read own reports"
  on public.reports
  for select
  using (auth.uid() = profile_id);
