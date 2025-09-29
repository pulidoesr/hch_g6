// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql, DbUser, getUserRoles } from "@/lib/db";

const roles = await getUserRoles();

console.log('Roles:' + roles)


export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  // debug: true,              // optional
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
          SELECT id, name, email, image, role, password_hash
          FROM public.users
          WHERE lower(email) = ${email}
          LIMIT 1
        `;
        const user = (rows as DbUser[])[0];
        if (!user?.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role ?? "buyer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role ?? "customer";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role ?? "customer";
      return session;
    },
  },
});
