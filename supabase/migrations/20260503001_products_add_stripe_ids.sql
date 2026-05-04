ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
