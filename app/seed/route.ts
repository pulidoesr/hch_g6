// app/seed/route.ts (remove/protect in prod)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function GET() {
  const email = "g6@wdd430.edu";
  const name = "hch g6";
  const plain = "pass123";
  const hash = await bcrypt.hash(plain, 10);

  await sql/* sql */`
    INSERT INTO public.users (id, name, email, password_hash, image, role)
    VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${hash}, NULL, 'buyer')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;

  return NextResponse.json({ ok: true });
}
