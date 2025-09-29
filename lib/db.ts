// lib/db.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// types
export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;       // enum/text
  password_hash: string;
};

// a small helper (optional)
export function firstRow<T>(rows: unknown[]): T | null {
  return (rows as T[])[0] ?? null;
}

export async function getUserRoles(): Promise<string[]> {
  const rows = await sql`SELECT unnest(enum_range(NULL::user_role)) AS value`;
  return (rows as Array<{ value: string }>).map(r => r.value);
}