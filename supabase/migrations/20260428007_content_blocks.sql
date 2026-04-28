create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_type text not null check (block_type in ('proverb', 'saying', 'quote')),
  content text not null,
  attribution text,
  report_section text,
  tags text[],
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.content_blocks enable row level security;

create policy "Authenticated users can read active content blocks"
  on public.content_blocks
  for select
  to authenticated
  using (active = true);
