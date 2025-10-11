// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/server/actions/data_bridge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') || '').toLowerCase();

  // ✅ Await the promise so we have a real array
  let products = await getAllProducts();

  if (category) {
    products = products.filter(p =>
      (p.name || '').toLowerCase().includes(category) ||
      (p.description || '').toLowerCase().includes(category) ||
      (p.imageUrl || '').toLowerCase().includes(category)
    );
  }

  return NextResponse.json(products);
}
