-- Already applied directly to Supabase on 29 Apr 2026

ALTER TABLE card_library ADD COLUMN IF NOT EXISTS daily_energy_heading text;
ALTER TABLE card_library ADD COLUMN IF NOT EXISTS daily_energy_body text;
ALTER TABLE card_library ADD COLUMN IF NOT EXISTS daily_energy_cta text;
