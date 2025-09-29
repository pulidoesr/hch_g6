// lib/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string | null;
  }
}
