'use client';

import { useMemo } from 'react';
import type { Product } from '@/lib/types/product-data';

export type InspirationSectionProps = {
  /** New prop (what app/page.tsx passes) */
  products?: Product[];
  /** Legacy prop (if anywhere else still uses it) */
  productsData?: Product[];
};

export default function InspirationSection({
  products,
  productsData,
}: InspirationSectionProps) {
  // Compute ideas in a single memo using only stable props as deps
  const ideas = useMemo(() => {
    const src = Array.isArray(products)
      ? products
      : Array.isArray(productsData)
      ? productsData
      : [];
    return src.slice(0, 6);
  }, [products, productsData]);

  if (ideas.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Inspiration</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ideas.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <img
              src={p.imageUrl || '/placeholder.png'}
              alt={p.name}
              className="w-full h-40 object-cover rounded"
              loading="lazy"
            />
            <div className="mt-2 font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">
              ${Number(p.price ?? 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
