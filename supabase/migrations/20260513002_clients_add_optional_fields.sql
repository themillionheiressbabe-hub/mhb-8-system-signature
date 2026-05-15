alter table public.clients
  add column if not exists chosen_name text,
  add column if not exists email text;
