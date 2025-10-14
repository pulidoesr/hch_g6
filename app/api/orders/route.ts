import { NextResponse } from "next/server";
import type { OrderDataInput, SaveOrderResult } from "@/lib/shared/order-types";
// import { sql } from "@/lib/db"; // uncomment when wiring to DB

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderDataInput;

    // TODO: validate input thoroughly
    if (!body.lines?.length || !body.currency || typeof body.totalCents !== "number") {
      const res: SaveOrderResult = { ok: false, error: "Invalid order payload" };
      return NextResponse.json(res, { status: 400 });
    }

    // --- Persist (stub). Replace with real INSERT and return the new id.
    // const rows = await sql`
    //   INSERT INTO orders (user_id, currency, total_cents, notes)
    //   VALUES (${body.userId}, ${body.currency}, ${body.totalCents}, ${body.notes})
    //   RETURNING id
    // `;
    // const orderId = rows[0].id as string;

    const orderId = `TEMP-${Date.now()}`; // stub so your build succeeds

    const res: SaveOrderResult = { ok: true, orderId };
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    const res: SaveOrderResult = { ok: false, error: err?.message ?? "Unknown error" };
    return NextResponse.json(res, { status: 500 });
  }
}
