// components/FeaturedProductCard/SimpleProductCard.tsx

import React from "react";
// import type { Product } from "@/lib/types/product-data"; // ❌ not needed any more

type SimpleProductCardProps = {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  rating?: number;
  description?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
};

export default function SimpleProductCard({
  id,
  imageUrl,
  name,
  price,
  rating = 0,
  description = "",
  isFeatured = false,
  isNew = false,
  isBestSeller = false,
  isOnSale = false,
}: SimpleProductCardProps) {
  // …render whatever you already have, using the fields above…
  return (
    <article data-id={id} className="rounded-lg shadow p-4">
      <img src={imageUrl} alt={name} className="w-full h-48 object-cover rounded-md" />
      <h3 className="mt-3 font-semibold">{name}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      <div className="mt-2 font-bold">${price.toFixed(2)}</div>
      {/* badges, rating, etc. */}
    </article>
  );
}
