-- sanity
SELECT current_database() AS db, current_user AS usr;

-- create the project schema
CREATE SCHEMA IF NOT EXISTS hch AUTHORIZATION neondb_owner;

-- verify it exists
SELECT nspname, nspowner::regrole FROM pg_namespace WHERE nspname = 'hch';
