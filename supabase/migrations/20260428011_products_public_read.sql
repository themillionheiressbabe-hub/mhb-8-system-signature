drop policy if exists "Authenticated users can read active products" on public.products;

create policy "Anyone can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);
