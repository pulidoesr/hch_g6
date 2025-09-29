-- Type: user_role

-- DROP TYPE IF EXISTS public.user_role;

CREATE TYPE public.user_role AS ENUM
    ('buyer', 'seller', 'admin');

ALTER TYPE public.user_role
    OWNER TO neondb_owner;
