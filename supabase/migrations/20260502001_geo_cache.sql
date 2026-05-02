CREATE TABLE IF NOT EXISTS geo_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL UNIQUE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_cache_city ON geo_cache(city);

ALTER TABLE geo_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON geo_cache;
CREATE POLICY "Service role full access"
  ON geo_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
