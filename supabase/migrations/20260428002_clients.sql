create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  date_of_birth date not null,
  time_of_birth time,
  place_of_birth text,
  latitude numeric,
  longitude numeric,
  timezone text,
  is_joker boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_client_joker_flag()
returns trigger
language plpgsql
as $$
begin
  if extract(month from new.date_of_birth) = 12
     and extract(day from new.date_of_birth) = 31 then
    new.is_joker := true;
  end if;
  return new;
end;
$$;

create trigger clients_set_joker_flag
  before insert or update of date_of_birth on public.clients
  for each row execute function public.set_client_joker_flag();

alter table public.clients enable row level security;

create policy "Users can manage own clients"
  on public.clients
  for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
