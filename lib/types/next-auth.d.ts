// lib/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;                // if you need it
    role?: string | null;
    sellerId?: string | null;   // <-- add this
  }

  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: string | null;
      sellerId?: string | null; // <-- add this
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;               // next-auth sets this to user id
    role?: string | null;
    sellerId?: string | null;   // <-- add this
  }
}