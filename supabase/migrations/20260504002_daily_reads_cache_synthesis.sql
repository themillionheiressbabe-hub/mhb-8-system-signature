-- Add synthesis_read column to daily_reads_cache
-- Holds the Claude-generated cross-system synthesis paragraph
-- shown at the top of /tools (Cosmic Weather)

ALTER TABLE daily_reads_cache
  ADD COLUMN IF NOT EXISTS synthesis_read TEXT;
