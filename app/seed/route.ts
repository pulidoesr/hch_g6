// app/seed/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

async function seedOnce() {
  const email = "seller@wdd430.edu";
  const name = "Seller Group6";
  const hash = await bcrypt.hash("pass123", 10);

  const rows = await sql/* sql */`
    INSERT INTO public.users (name, email, password_hash, image, role)
    VALUES (${name}, ${email}, ${hash}, NULL, 'seller')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name
    RETURNING id, email, name, role;
  `;

  const diag = await sql/* sql */`
    SELECT current_database() AS db, current_user AS usr, current_schema AS sch;
  `;

  return { user: rows[0], diag: diag[0] };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function POST() {
  try {
    const data = await seedOnce();
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}

// TEMP for local browser click; remove in prod
export async function GET() {
  try {
    const data = await seedOnce();
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
