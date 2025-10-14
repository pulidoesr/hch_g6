// app/seller/page.tsx
import { auth } from "@/auth";
import { loadSellerData } from "@/lib/server/actions/data_bridge";
import Link from "next/link";




export default async function SellerDashboardPage() {
  const session = await auth();
  const sellerId = (session?.user as any)?.sellerId;

  if (!sellerId) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
        <p>This account isn’t linked to a seller.</p>
      </div>
    );
  }

  const { seller, products } = await loadSellerData(sellerId);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 pt-12">
        {seller?.name ?? "Seller"}
      </h1>

      {/* render products safely */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {products.map(p => (
            <Link
              key={p.id}
              href={`/product_detail/${p.slug ?? p.id}`}
              className="block border rounded p-3"
            >
              <img
                src={p.primary_image ?? "/placeholder.png"}
                alt={p.title}
                className="w-full h-40 object-cover rounded"
              />
              <div className="mt-2 font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">
                ${(p.price_cents / 100).toFixed(2)} {p.currency}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
