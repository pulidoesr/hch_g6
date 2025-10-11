"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types/product-data";

/* ---------------------------------------------
   1) Narrow props for the card (only what's used)
---------------------------------------------- */
type SimpleProductCardProps = {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  rating?: number;
  description?: string;
};

/* ---------------------------------------------
   2) Typed Card Component
---------------------------------------------- */
const SimpleProductCard: React.FC<SimpleProductCardProps> = ({
  imageUrl,
  name,
  price,
  id,
  rating,
}) => {
  // optional little star row if rating is provided
  const stars =
    typeof rating === "number"
      ? "★".repeat(Math.round(Math.min(5, Math.max(0, rating)))) +
        "☆".repeat(5 - Math.round(Math.min(5, Math.max(0, rating))))
      : null;

  return (
    <Link
      href={`/product_detail/${id}`}
      className="block w-full h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-100"
      aria-label={`View details for ${name}`}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/400x300/333333/ffffff?text=Product";
          }}
          loading="lazy"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col items-center text-center">
        <p className="text-gray-800 text-sm font-medium truncate w-full" title={name}>
          {name}
        </p>

        {stars && (
          <p className="mt-1 text-yellow-500 text-sm" aria-label={`Rating ${rating} out of 5`}>
            {stars}
          </p>
        )}

        <p className="text-2xl font-extrabold text-gray-900 mt-2">
          R$ {Number.isFinite(price) ? Number(price).toFixed(2) : "N/A"}
        </p>
      </div>
    </Link>
  );
};

/* ---------------------------------------------
   Helpers
---------------------------------------------- */
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
};

/* ---------------------------------------------
   3) MAIN CLIENT COMPONENT (typed)
---------------------------------------------- */
interface FeaturedProductGalleryProps {
  allProducts: Product[];
}

const FeaturedProductGallery: React.FC<FeaturedProductGalleryProps> = ({
  allProducts,
}) => {
  const [randomFeatured, setRandomFeatured] = useState<Product[]>([]);
  const CARD_COUNT = 4;

  useEffect(() => {
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      const featured = allProducts.filter((p) => p.isFeatured);
      const selected = getRandomItems(featured, CARD_COUNT);
      setRandomFeatured(selected);
    } else {
      setRandomFeatured([]);
    }
  }, [allProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
        Featured Products
      </h2>

      {randomFeatured.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {randomFeatured.map((product) => (
            <SimpleProductCard
              key={product.id}
              id={product.id}
              imageUrl={product.imageUrl}
              name={product.name}
              price={product.price}
              rating={product.rating}
              description={product.description}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 p-8">No featured products available.</p>
      )}
    </div>
  );
};

export default FeaturedProductGallery;
