-- Handcrafted Haven • PostgreSQL schema (structure only)

-- DB: neondb

CREATE EXTENSION IF NOT EXISTS pgcrypto;  
CREATE EXTENSION IF NOT EXISTS citext;    

-- 1) Create the schema
CREATE SCHEMA IF NOT EXISTS hch AUTHORIZATION neondb_owner;

-- 2) Create a dedicated login role for the new project (change password!)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hch_user') THEN
    CREATE ROLE hch_user LOGIN PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
  END IF;
END$$;

-- 3) Restrict & grant access to the new schema
REVOKE ALL ON SCHEMA hch FROM PUBLIC;
GRANT USAGE ON SCHEMA hch TO hch_user;

-- 4) Default privileges for ALL future objects created in schema hch
ALTER DEFAULT PRIVILEGES IN SCHEMA hch
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hch_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA hch
  GRANT USAGE, SELECT ON SEQUENCES TO hch_user;

-- 5) If you already created any tables in hch, grant on existing ones too:
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA hch TO hch_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA hch TO hch_user;

-- 6) Make the new schema the default search path for this role
ALTER ROLE hch_user IN DATABASE neondb SET search_path = hch, public;

-- Enum for role (scoped inside hch to avoid name clashes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role' AND n.nspname = 'hch'
  ) THEN
    CREATE TYPE hch.user_role AS ENUM ('buyer','seller','admin');
  END IF;
END$$;

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION hch.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS table (Postgres version of your Mongoose schema)
CREATE TABLE IF NOT EXISTS hch.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text,
  email         citext NOT NULL UNIQUE,                 
  image         text,
  role          hch.user_role NOT NULL DEFAULT 'buyer',
  seller_handle text,                                   
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Update trigger for timestamps
DROP TRIGGER IF EXISTS trg_hch_users_updated ON hch.users;
CREATE TRIGGER trg_hch_users_updated
BEFORE UPDATE ON hch.users
FOR EACH ROW EXECUTE FUNCTION hch.set_updated_at();

-- Sparse-unique equivalent for sellerHandle:

CREATE UNIQUE INDEX IF NOT EXISTS uq_hch_users_seller_handle_present
  ON hch.users (seller_handle)
  WHERE seller_handle IS NOT NULL;
