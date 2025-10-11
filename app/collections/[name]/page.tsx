// app/collections/[name]/page.tsx
import { notFound } from "next/navigation";
import { fetchCollectionByName } from "@/lib/db";

export const revalidate = 60;

type Params = { name: string };
type MaybePromise<T> = T | Promise<T>;
type PageProps = { params: MaybePromise<Params> };

export default async function CollectionDetailPage({ params }: PageProps) {
  const { name } = await Promise.resolve(params);
  const decoded = decodeURIComponent(name);
  const collection = await fetchCollectionByName(decoded);
  if (!collection) return notFound();

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold mb-4">{collection.name}</h1>
      {collection.story && <p className="text-gray-600 mb-6">{collection.story}</p>}

      <h2 className="text-xl font-semibold mb-2">Items</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {collection.items.map((p) => (
          <a key={p.id} href={`/product_detail/${p.id}`} className="border rounded-lg overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100">
              {p.primary_image ? (
                <img src={p.primary_image} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-500">${(p.price_cents / 100).toFixed(2)}</div>
            </div>
          </a>
        ))}
      </div>

      {collection.recommendations.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-2">You might also like</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {collection.recommendations.map((p) => (
              <a key={p.id} href={`/product_detail/${p.id}`} className="border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100">
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm">{p.title}</div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
