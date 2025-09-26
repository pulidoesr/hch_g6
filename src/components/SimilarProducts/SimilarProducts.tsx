'use client';

import Image from "next/image";
import Link from 'next/link';
import { Star } from "lucide-react";

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  rating: number;
}

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Star
        key="half"
        className="w-4 h-4 text-yellow-400"
        style={{ fill: "url(#half-gradient)" }}
      />
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
  }

  return (
    <div className="flex items-center gap-1 relative">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half-gradient" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="50%" stopColor="rgb(250 204 21)" />
            <stop offset="50%" stopColor="rgb(209 213 219)" />
          </linearGradient>
        </defs>
      </svg>
      {stars}
    </div>
  );
};

export default function SimilarProducts({ products }: { products: Product[] }) {
  return (
    <section>
      <hr className="my-8 border-gray-300" />
      <h2 className="text-3xl font-bold text-center text-primary-800">Similar Products</h2>
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {products.map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}`} passHref>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="relative w-40 h-40 mb-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="flex items-center my-2">
                {renderStars(product.rating)}
              </div>
              <p className="text-lg font-bold text-gray-900">R$ {product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}