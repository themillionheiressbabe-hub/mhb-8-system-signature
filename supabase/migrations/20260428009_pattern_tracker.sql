create table public.pattern_tracker (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  state text not null check (state in ('locked_in', 'checked_out')),
  supporting_term text check (supporting_term in ('on_autopilot', 'running_on_fumes', 'off_centre', 'in_the_spiral')),
  notes text,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.pattern_tracker enable row level security;

create policy "Users can read own pattern tracker rows"
  on public.pattern_tracker
  for select
  using (auth.uid() = profile_id);

create policy "Users can insert own pattern tracker rows"
  on public.pattern_tracker
  for insert
  with check (auth.uid() = profile_id);
