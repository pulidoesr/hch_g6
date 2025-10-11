// app/collections/page.tsx
import { fetchCollectionsSummary } from "@/lib/db";
import Link from "next/link";

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await fetchCollectionsSummary();

  if (!collections.length) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center text-gray-600">
        <h1 className="text-3xl font-bold mb-2">Collections</h1>
        <p>No collections yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold mb-6">Collections</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${encodeURIComponent(c.name)}`}>
            <div className="rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="aspect-[16/9] bg-gray-100">
                {c.hero_image ? (
                  <img
                    src={c.hero_image}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">{c.item_count} items</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
