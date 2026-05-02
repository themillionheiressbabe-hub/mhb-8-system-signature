CREATE TABLE IF NOT EXISTS daily_reads_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_date DATE NOT NULL UNIQUE,
  card_code TEXT NOT NULL,
  daily_read TEXT NOT NULL,
  numerology_number INTEGER NOT NULL,
  numerology_meaning TEXT NOT NULL,
  sun_sign TEXT NOT NULL,
  sun_sign_theme TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_reads_cache_date ON daily_reads_cache(cache_date);

ALTER TABLE daily_reads_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_reads_cache anon read" ON daily_reads_cache;
CREATE POLICY "daily_reads_cache anon read"
  ON daily_reads_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "daily_reads_cache service insert" ON daily_reads_cache;
CREATE POLICY "daily_reads_cache service insert"
  ON daily_reads_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true);
