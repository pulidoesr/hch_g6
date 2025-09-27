-- Ensure project schema + helpers exist (safe to re-run)
CREATE SCHEMA IF NOT EXISTS hch;
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- Timestamp helper (noop if already defined)
CREATE OR REPLACE FUNCTION hch.set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Order status enum (same as earlier)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status' AND n.nspname = 'hch'
  ) THEN
    CREATE TYPE hch.order_status AS ENUM
      ('pending','paid','shipped','delivered','cancelled','refunded');
  END IF;
END$$;


-- Orders (parent)

CREATE TABLE IF NOT EXISTS hch.orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id          uuid NOT NULL REFERENCES hch.users(id) ON DELETE RESTRICT,  
  amount            numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency          text NOT NULL DEFAULT 'USD',
  stripe_session_id text,
  status            hch.order_status NOT NULL DEFAULT 'pending',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_hch_orders_updated ON hch.orders;
CREATE TRIGGER trg_hch_orders_updated
BEFORE UPDATE ON hch.orders
FOR EACH ROW EXECUTE FUNCTION hch.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_hch_orders_buyer   ON hch.orders (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hch_orders_status  ON hch.orders (status, created_at DESC);



-- Order items (embedded array -> child rows)

CREATE TABLE IF NOT EXISTS hch.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES hch.orders(id)   ON DELETE CASCADE,
  product_id  uuid     REFERENCES hch.products(id)      ON DELETE RESTRICT,
  title       text NOT NULL,                             -- snapshot at purchase time
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  qty         integer NOT NULL CHECK (qty > 0)
);

CREATE INDEX IF NOT EXISTS idx_hch_order_items_order ON hch.order_items (order_id);
