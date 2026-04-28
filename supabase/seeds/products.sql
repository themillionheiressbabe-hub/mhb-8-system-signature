insert into public.products
  (slug, name, engine, price_pence, currency, is_active, is_free, requires_time_of_birth)
values
  -- Engine 1
  ('daily-frequency-free', 'Daily Frequency · Free', 1, 0, 'gbp', true, true, false),
  ('babe-life-spread', 'The BABE Life Spread', 1, 1400, 'gbp', true, false, false),
  ('babe-mirror', 'The BABE Mirror', 1, 2400, 'gbp', true, false, false),
  ('babe-lens', 'The BABE Lens', 1, 3700, 'gbp', true, false, true),
  ('babe-crossing', 'The BABE Crossing', 1, 4700, 'gbp', true, false, true),
  ('babe-reckoning', 'The BABE Reckoning', 1, 5700, 'gbp', true, false, true),
  ('babe-rebuild', 'The BABE Rebuild', 1, 6700, 'gbp', true, false, true),
  ('babe-90', 'The BABE 90', 1, 7700, 'gbp', true, false, true),

  -- Engine 2
  ('babe-signature', 'The BABE Signature', 2, 12700, 'gbp', true, false, true),

  -- Engine 3
  ('babe-business-lens', 'The BABE Business Lens', 3, 3700, 'gbp', true, false, false),
  ('babe-brand-frequency', 'The BABE Brand Frequency', 3, 3700, 'gbp', true, false, false),
  ('babe-founder-read', 'The BABE Founder Read', 3, 5700, 'gbp', true, false, false),
  ('babe-business-signature', 'The BABE Business Signature', 3, 14700, 'gbp', true, false, false),

  -- Engine 4
  ('babe-bond-mother-daughter', 'The BABE Bond · Mother + Daughter', 4, 2700, 'gbp', true, false, false),
  ('babe-bond-co-parenting', 'The BABE Bond · Co-Parenting', 4, 3700, 'gbp', true, false, false),
  ('babe-bond-lens', 'The BABE Bond Lens', 4, 4700, 'gbp', true, false, false),
  ('babe-bond-signature', 'The BABE Bond Signature', 4, 17700, 'gbp', true, false, false),

  -- Engine 5
  ('daily-frequency-personal', 'Daily Frequency · Personal', 5, 499, 'gbp', true, false, false),

  -- Engine 6
  ('babe-pulse', 'The BABE Pulse', 6, 2700, 'gbp', true, false, false),
  ('babe-business-pulse', 'The BABE Business Pulse', 6, 2700, 'gbp', true, false, false),
  ('babe-bond-pulse', 'The BABE Bond Pulse', 6, 4700, 'gbp', true, false, false),
  ('your-babe-year-map', 'Your BABE Year Map', 6, 5700, 'gbp', true, false, false),
  ('your-babe-business-year', 'Your BABE Business Year', 6, 5700, 'gbp', true, false, false),
  ('your-babe-bond-year', 'Your BABE Bond Year', 6, 7700, 'gbp', true, false, false),

  -- Engine 7 (3 pricing tiers for the 52-week journey)
  ('babe-52-week-journey', 'The BABE 52-Week Journey', 7, 14700, 'gbp', true, false, false),
  ('babe-52-week-journey-monthly', 'The BABE 52-Week Journey · Monthly', 7, 1499, 'gbp', true, false, false),
  ('babe-52-week-journey-skool', 'The BABE 52-Week Journey · Skool', 7, 12700, 'gbp', true, false, false),

  -- Free tools
  ('birthprint-snapshot', 'Birthprint Snapshot', 1, 0, 'gbp', true, true, false),
  ('your-babe-year-free', 'Your BABE Year · Free', 6, 0, 'gbp', true, true, false);
