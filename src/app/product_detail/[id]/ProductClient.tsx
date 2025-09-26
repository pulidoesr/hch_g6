'use client';

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import SimilarProducts from '@app/components/SimilarProducts/SimilarProducts';

// Definimos uma nova interface para os reviews
interface Review {
  customerName: string;
  customerImage: string;
  rating: number;
  date: string;
  comment: string;
}

// Atualizamos a interface do produto para incluir o array de reviews
interface Product {
  id: string;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  name: string;
  price: number;
  rating: number;
  reviews: Review[]; // Adicionamos o novo campo
}

interface ProductClientProps {
  product: Product;
  similarProducts: Product[];
}

export default function ProductClient({ product, similarProducts }: ProductClientProps) {
  const [mainImage, setMainImage] = useState(
    product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl
  );

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-6 h-6 text-yellow-400"
          style={{ fill: "url(#half-gradient)" }}
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-6 h-6 text-gray-300" />);
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
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-[10px] w-[100vw] mt-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Galeria */}
        <div className="flex-1 relative">
          <div className="relative w-full h-[500px]">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="rounded-lg shadow-lg object-cover"
            />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.imageUrls.slice(0, 3).map((url, index) => (
              <button
                key={index}
                onClick={() => setMainImage(url)}
                className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 transition ${
                  mainImage === url
                    ? "border-red-600"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                <Image
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-primary-800">{product.name}</h1>

          {/* Rating */}
          <div className="mt-2">{renderStars(product.rating)}</div>

          {/* divisor */}
          <hr className="my-6 border-gray-300" />

          {/* Preço */}
          <p className="text-2xl text-gray-900 font-semibold">
            R$ {product.price.toFixed(2)}
          </p>

          {/* divisor */}
          <hr className="my-6 border-gray-300" />

          {/* Descrição */}
          <p className="mt-2 text-lg text-gray-700">{product.description}</p>

          <button className="mt-8 w-full px-8 py-3 font-bold rounded-lg shadow-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-300">
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Seção de Produtos Similares */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-7xl">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>
      
      {/* Separador e Seção de Reviews */}
      <hr className="my-8 border-gray-300" />
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Reviews</h2>
        <div className="space-y-8">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded-lg shadow-sm bg-white">
                {/* Foto do Cliente */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={review.customerImage}
                    alt={review.customerName}
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                
                {/* Container para Nome, Data, Rating e Comentário */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Nome, Data e Rating */}
                  <div className="flex flex-col w-full sm:w-auto">
                    <h4 className="font-semibold text-lg">{review.customerName}</h4>
                    <span className="text-sm text-gray-500">{review.date}</span>
                    <div className="mt-1">{renderStars(review.rating)}</div>
                  </div>
                  
                  {/* Comentário */}
                  <div className="flex-1">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Nenhuma avaliação encontrada para este produto.</p>
          )}
        </div>
      </div>

    </div>
  );
}