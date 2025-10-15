import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSellerProduct, deleteSellerProduct } from "@/lib/repositories/sellerProducts";

const UpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  price_cents: z.number().int().min(0).optional(),
  currency: z.string().min(3).max(3).optional(),
  slug: z.string().min(2).optional(),
  primary_image: z.string().url().optional().nullable(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  if (!session || role !== "seller" || !sellerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateSellerProduct(sellerId, params.id, parsed.data);
  if (!updated) {
    // either not found or not owned by this seller
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  if (!session || role !== "seller" || !sellerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await deleteSellerProduct(sellerId, params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: deleted.id });
}
