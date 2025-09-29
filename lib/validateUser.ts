// lib/auth/validateUser.ts
import bcrypt from 'bcryptjs';
import { sql, firstRow, DbUser } from '@/lib/db';

export async function validateUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();

  const rows = await sql`
    SELECT id, name, email, image, role, password_hash
    FROM public.users
    WHERE email = ${email}
    LIMIT 1
  `;

  const user = firstRow<DbUser>(rows);
  if (!user?.password_hash) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;

  // return safe fields only (this becomes session.user if used in NextAuth)
  return {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    image: user.image ?? undefined,
    role: user.role ?? 'customer', // or whatever your enum’s default is
  };
}
