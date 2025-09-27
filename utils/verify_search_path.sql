SELECT current_database() AS db, current_user AS usr;

-- Is there a saved setting for this role+db?
SELECT setconfig
FROM pg_db_role_setting
WHERE setrole = (SELECT oid FROM pg_roles    WHERE rolname = current_user)
  AND setdatabase = (SELECT oid FROM pg_database WHERE datname = current_database());
