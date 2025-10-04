// example: app/api/signup/route.ts
import { NextResponse } from "next/server";
export async function POST(_req: Request) {
  try {
    // ...
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[/api/signup]", e);
    return NextResponse.json({ error: "Unable to sign up" }, { status: 500 });
  }
}
