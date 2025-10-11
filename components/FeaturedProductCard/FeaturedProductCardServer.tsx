// components/FeaturedProductCard/FeaturedProductCardServer.tsx
import SimpleProductCard from "./SimpleProductCard";
import { getHomeFeaturedProducts } from "@/lib/repositories/products";

// Optional ISR so this doesn't hit DB on every request
export const revalidate = 60;

export default async function FeaturedProductCardServer() {
  // DB: returns rows like { id, imageUrl, description, price, isFeatured }
  const featured = await getHomeFeaturedProducts(8);

  if (!featured || featured.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {featured.map((p) => (
        <SimpleProductCard
          key={p.id}
          id={p.id}
          imageUrl={p.imageUrl}
          name={p.description || "Untitled"}
          price={p.price}
          // optional extras (SimpleProductCard props are tolerant)
          isFeatured={true}
        />
      ))}
    </div>
  );
}
