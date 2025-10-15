import { auth } from "@/auth";
import { loadSellerData } from "@/lib/server/actions/data_bridge";
import Link from "next/link";
import { deleteProductAction } from "./actions";

export default async function SellerDashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  if (!sellerId || role !== "seller") {
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
      <div className="flex items-center justify-between pt-12 mb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {seller?.name ?? "Seller"}
        </h1>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800"
        >
          + New Product
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-3">
            <Link href={`/product_detail/${p.slug ?? p.id}`} className="block">
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

            {/* Controls: no onClick/onSubmit here */}
            <div className="mt-3 flex gap-3 items-center">
              <Link
                href={`/seller/products/${p.id}/edit`}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </Link>

              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
