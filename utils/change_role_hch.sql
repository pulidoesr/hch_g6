-- set default search_path for the role you connect with
ALTER ROLE neondb_owner IN DATABASE neondb SET search_path = hch, public;

-- reconnect (open a new session) and verify:
SHOW search_path;  -- should now show: hch, public
