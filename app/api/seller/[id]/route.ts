import { NextRequest, NextResponse } from "next/server";
// import your zod schema, db, etc.

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;          // ✅ await params

  const body = await request.json();
  // validate / update
  // const parsed = schema.safeParse(body);
  // if (!parsed.success) {
  //   return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // }

  // await db.updateProduct(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;          // ✅ await params
  // const product = await db.getProduct(id);
  return NextResponse.json({ id });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;          // ✅ await params
  // await db.deleteProduct(id);
  return NextResponse.json({ ok: true });
}
