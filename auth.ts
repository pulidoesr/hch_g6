// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql, type DbUser } from "@/lib/db";

/* --- Module augmentation so TS knows about our custom fields --- */
declare module "next-auth" {
  interface User {
    role?: string | null;
    sellerId?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      sellerId?: string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    sellerId?: string | null;
  }
}

type DbUserWithSeller = DbUser & { seller_id: string | null };

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  trustHost: true,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email?.toString().trim().toLowerCase();
        const password = creds?.password?.toString() ?? "";
        if (!email || !password) return null;

        const rows = await sql`
          SELECT id, name, email, image, role, password_hash, seller_id
          FROM public.users
          WHERE lower(email) = ${email}
          LIMIT 1
        `;
        const user = (rows as DbUserWithSeller[])[0];
        if (!user?.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        // Put sellerId on the returned user so it reaches the JWT callback.
        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role ?? "buyer",
          sellerId: user.seller_id ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, copy fields from the user into the token.
      if (user) {
        token.role = user.role ?? "customer";
        token.sellerId = user.sellerId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose our custom fields on the session.user object.
      if (session.user) {
        session.user.role = token.role ?? "customer";
        session.user.sellerId = token.sellerId ?? null;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const u = new URL(url, baseUrl);
      if (u.origin !== baseUrl) return baseUrl;
      if (u.pathname === "/profiles") u.pathname = "/profile";
      return u.toString();
    },
  },
});
