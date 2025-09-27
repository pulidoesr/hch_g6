-- Schema verification
CREATE SCHEMA IF NOT EXISTS hch;
CREATE EXTENSION IF NOT EXISTS pgcrypto;   
CREATE EXTENSION IF NOT EXISTS pg_trgm;    

CREATE OR REPLACE FUNCTION hch.set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ========================
-- Products
-- ========================
CREATE TABLE IF NOT EXISTS hch.products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     uuid NOT NULL REFERENCES hch.users(id) ON DELETE CASCADE,  
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  description   text,
  price         numeric(12,2) NOT NULL,            
  currency      text NOT NULL DEFAULT 'USD',
  category      text,                               
  tags          text[] NOT NULL DEFAULT '{}',       
  rating_avg    numeric(3,2) NOT NULL DEFAULT 0,    
  rating_count  integer     NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  stock         integer     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_published  boolean     NOT NULL DEFAULT false, 
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_hch_products_updated ON hch.products;
CREATE TRIGGER trg_hch_products_updated
BEFORE UPDATE ON hch.products
FOR EACH ROW EXECUTE FUNCTION hch.set_updated_at();

-- Indexes 
CREATE INDEX IF NOT EXISTS idx_hch_products_seller      ON hch.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_hch_products_price       ON hch.products(price);
CREATE INDEX IF NOT EXISTS idx_hch_products_category    ON hch.products(category);
CREATE INDEX IF NOT EXISTS idx_hch_products_rating_avg  ON hch.products(rating_avg);
CREATE INDEX IF NOT EXISTS idx_hch_products_is_published ON hch.products(is_published);
CREATE INDEX IF NOT EXISTS idx_hch_products_tags_gin    ON hch.products USING gin (tags);

-- Text search–style 
CREATE INDEX IF NOT EXISTS idx_hch_products_title_trgm  ON hch.products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hch_products_slug_trgm   ON hch.products USING gin (slug  gin_trgm_ops);

-- Optional bounds on rating_avg 
ALTER TABLE hch.products
  ADD CONSTRAINT chk_hch_products_rating_avg_range
  CHECK (rating_avg >= 0 AND rating_avg <= 5);

-- ========================
-- Product images 
-- ========================
CREATE TABLE IF NOT EXISTS hch.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES hch.products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt         text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hch_product_images_product ON hch.product_images(product_id, sort_order);
