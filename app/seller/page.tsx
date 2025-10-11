// app/page.tsx

// app/seller/page.tsx
import { loadSellerData } from "@/lib/server/actions/data_bridge";

export default async function SellerDashboard() {
  const { seller, products } = await loadSellerData(); // no numeric "1"
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 pt-12">
        {seller?.name ?? "Seller"}
      </h1>
      {/* ...render products safely... */}
    </div>
  );
}
