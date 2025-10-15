import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSellerProduct } from "@/lib/repositories/sellerProducts";

const BodySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  price_cents: z.number().int().min(0),
  currency: z.string().min(3).max(3), // "USD"
  slug: z.string().min(2),
  primary_image: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  if (!session || role !== "seller" || !sellerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const row = await createSellerProduct(sellerId, parsed.data);
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Create failed" }, { status: 500 });
  }
}
