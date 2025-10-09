import { NextResponse } from "next/server";
import { getAllProducts } from '@/lib/server/actions/data_bridge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const filter = searchParams.get("filter"); // bestseller | new | sale50 | offers
  
  const data = { products: getAllProducts() };
  let products = getAllProducts();

  if (category) {
    products = products.filter((p) =>
      p.imageUrl.toLowerCase().includes(category.toLowerCase())
    );
  }


  if (filter === "bestseller") {
    products = products.filter((p) => p.isBestSeller);
  } else if (filter === "new") {
    products = products.filter((p) => p.isNew);
  } else if (filter === "sale50") {
    products = products.filter((p) => p.isOnSale && p.price <= 0.5 * 100); // Exemplo: “ofertas 50%”
  } else if (filter === "offers") {
    products = products.filter((p) => p.isOnSale);
  }

  return NextResponse.json({ products });
}