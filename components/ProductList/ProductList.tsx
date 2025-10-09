"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from '@/lib/types/product-data';

export default function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => router.push(`/product_detail/${product.id}`)}
          className="flex flex-col border rounded-lg shadow hover:shadow-lg transition bg-white cursor-pointer"
        >
          <div className="relative w-full h-60">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <div className="p-4 flex flex-col justify-between flex-grow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {product.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            <p className="text-xl font-bold text-red-600">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}