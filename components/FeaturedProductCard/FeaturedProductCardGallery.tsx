"use client";

import React, { useState, useEffect } from 'react';
import { Product } from "@/lib/types/product-data"; 


// 1. Props Interface Definition for the main component
interface FeaturedProductGalleryProps {
    allProducts: Product[]; 
}


// 2. Typed Card Component
// We use React.FC and type the props using Product (or directly)
const SimpleProductCard: React.FC<Product> = ({
  imageUrl,
  name,
  price,
  id,
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
          // Fallback image for errors
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/333333/ffffff?text=Product'; }}
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col items-center text-center">
        <p className="text-gray-800 text-sm font-medium truncate w-full" title={name}>
          {name}
        </p>
        <p className="text-2xl font-extrabold text-gray-900 mt-2">
          R$ {price ? price.toFixed(2) : 'N/A'}
        </p>
      </div>
    </a>
  );
};


/**
 * Utility function to select random items (CLIENT-SIDE ONLY).
 * 🛑 Adding typing for parameters.
 */
const getRandomItems = (arr: Product[], count: number): Product[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};


// --- MAIN CLIENT COMPONENT (Now correctly typed) ---
const FeaturedProductGallery: React.FC<FeaturedProductGalleryProps> = ({ allProducts }) => {
    
    // 1. State to store random products
    const [randomFeatured, setRandomFeatured] = useState<Product[]>([]);
    const CARD_COUNT = 4;

    // 2. Randomization and Filter Logic
    useEffect(() => {
        if (allProducts && allProducts.length > 0) {
            const featured = allProducts.filter(p => p.isFeatured);
            const selected = getRandomItems(featured, CARD_COUNT);
            setRandomFeatured(selected);
        }
    }, [allProducts]); // allProducts is safe because it is immutable via props

    return (
       
          <div className="mx-auto max-w-7xl px-4 py-12">
              <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
                  Featured Products
              </h2>

              {randomFeatured.length > 0 ? (
                
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {randomFeatured.map(product => (
                          // Here we pass the typed props to the SimpleProductCard
                          <SimpleProductCard 
                              key={product.id} 
                              imageUrl={product.imageUrl} 
                              name={product.name} 
                              price={product.price}
                              isFeatured={product.isFeatured} // Including all Product props
                              id={product.id}
                          />
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-gray-500 p-8">
                      Loading featured products...
                  </p>
              )}
          </div>
    );
};

export default FeaturedProductGallery;
