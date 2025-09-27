-- Ensure schema + helpers exist (safe to re-run)
CREATE SCHEMA IF NOT EXISTS hch;
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- Timestamp helper (noop if already created)
CREATE OR REPLACE FUNCTION hch.set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ========================
-- Reviews
-- ========================
CREATE TABLE IF NOT EXISTS hch.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES hch.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES hch.users(id)    ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  -- one review per user per product (Mongo: index { productId:1, userId:1 }, unique: true)
  CONSTRAINT uq_hch_reviews_product_user UNIQUE (product_id, user_id),
  -- limit body length to 2000 (Mongo: maxlength: 2000)
  CONSTRAINT chk_hch_reviews_body_len CHECK (body IS NULL OR length(body) <= 2000)
);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_hch_reviews_updated ON hch.reviews;
CREATE TRIGGER trg_hch_reviews_updated
BEFORE UPDATE ON hch.reviews
FOR EACH ROW EXECUTE FUNCTION hch.set_updated_at();

-- Helpful indexes (composite unique covers join; add singles for filters)
CREATE INDEX IF NOT EXISTS idx_hch_reviews_product ON hch.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_hch_reviews_user    ON hch.reviews(user_id);
