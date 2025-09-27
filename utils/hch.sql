SELECT current_database() AS db,
       current_user       AS usr,
       current_setting('neon.branch_name', true) AS neon_branch,
       current_setting('search_path') AS search_path;
