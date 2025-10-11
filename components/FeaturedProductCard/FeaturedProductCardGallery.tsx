"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/lib/types/product-data";

/* ---------------------------------------------
   1) Narrow props for the card (no full Product)
---------------------------------------------- */
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
  return (
    <a
      href={`/product_detail/${id}`}
      className="block w-full h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-100"
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
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col items-center text-center">
        <p className="text-gray-800 text-sm font-medium truncate w-full" title={name}>
          {name}
        </p>
        <p className="text-2xl font-extrabold text-gray-900 mt-2">
          R$ {price ? price.toFixed(2) : "N/A"}
        </p>
      </div>
    </a>
  );
};

/* ---------------------------------------------
   Helpers
---------------------------------------------- */
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
    if (allProducts && allProducts.length > 0) {
      const featured = allProducts.filter((p) => p.isFeatured);
      const selected = getRandomItems(featured, CARD_COUNT);
      setRandomFeatured(selected);
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
              isFeatured={product.isFeatured}
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
              isOnSale={product.isOnSale}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 p-8">Loading featured products...</p>
      )}
    </div>
  );
};

export default FeaturedProductGallery;
